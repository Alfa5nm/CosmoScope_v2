import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

const { promises: fsp } = fs

type TileCacheKind = 'file' | 'redis'

export type TileCacheEntry = {
  buffer: Buffer
  contentType: string
  status: number
  headers?: Record<string, string>
}

export interface TileCache {
  readonly kind: TileCacheKind
  readonly defaultTtlSeconds: number
  get(key: string): Promise<TileCacheEntry | null>
  set(key: string, entry: TileCacheEntry, ttlSeconds?: number): Promise<void>
  delete(key: string): Promise<void>
}

type FileCacheMetadata = {
  contentType: string
  status: number
  headers?: Record<string, string>
  expiresAt: number
}

type CachePaths = {
  directory: string
  dataPath: string
  metaPath: string
}

type FileTileCacheOptions = {
  directory: string
  defaultTtlSeconds: number
  namespace?: string
  maxEntrySizeBytes?: number
}

class FileTileCache implements TileCache {
  public readonly kind: TileCacheKind = 'file'
  public readonly defaultTtlSeconds: number
  private readonly baseDir: string
  private readonly maxEntrySizeBytes: number | undefined

  constructor(options: FileTileCacheOptions) {
    this.defaultTtlSeconds = options.defaultTtlSeconds
    this.maxEntrySizeBytes = options.maxEntrySizeBytes
    const namespace = options.namespace?.trim() || 'tiles'
    this.baseDir = path.resolve(options.directory, namespace)
  }

  async get(key: string): Promise<TileCacheEntry | null> {
    const paths = this.resolvePaths(key)

    try {
      const metaRaw = await fsp.readFile(paths.metaPath, 'utf8')
      const metadata = JSON.parse(metaRaw) as FileCacheMetadata

      if (!metadata || typeof metadata.expiresAt !== 'number' || metadata.expiresAt <= Date.now()) {
        await this.safeDelete(paths)
        return null
      }

      const buffer = await fsp.readFile(paths.dataPath)
      const entry: TileCacheEntry = {
        buffer,
        contentType: metadata.contentType,
        status: metadata.status
      }

      if (metadata.headers) {
        entry.headers = metadata.headers
      }

      return entry
    } catch (error) {
      const err = error as NodeJS.ErrnoException
      if (err?.code === 'ENOENT') {
        return null
      }
      console.warn('[tile-cache] Failed to read cached tile:', err?.message ?? error)
      return null
    }
  }

  async set(key: string, entry: TileCacheEntry, ttlSeconds?: number): Promise<void> {
    const paths = this.resolvePaths(key)

    if (this.maxEntrySizeBytes && entry.buffer.length > this.maxEntrySizeBytes) {
      return
    }

    const expiresAt = Date.now() + 1000 * (ttlSeconds && ttlSeconds > 0 ? ttlSeconds : this.defaultTtlSeconds)
    const metadata: FileCacheMetadata = {
      contentType: entry.contentType,
      status: entry.status,
      expiresAt
    }

    if (entry.headers) {
      metadata.headers = entry.headers
    }

    try {
      await fsp.mkdir(paths.directory, { recursive: true })
      await Promise.all([
        fsp.writeFile(paths.dataPath, entry.buffer),
        fsp.writeFile(paths.metaPath, JSON.stringify(metadata))
      ])
    } catch (error) {
      console.warn('[tile-cache] Failed to cache tile to disk:', (error as Error).message ?? error)
    }
  }

  async delete(key: string): Promise<void> {
    const paths = this.resolvePaths(key)
    await this.safeDelete(paths)
  }

  private resolvePaths(key: string): CachePaths {
    const hashed = hashKey(key)
    const shardA = hashed.slice(0, 2)
    const shardB = hashed.slice(2, 4)
    const directory = path.join(this.baseDir, shardA, shardB)
    const baseName = path.join(directory, hashed)

    return {
      directory,
      dataPath: `${baseName}.bin`,
      metaPath: `${baseName}.json`
    }
  }

  private async safeDelete(paths: CachePaths): Promise<void> {
    await Promise.all([
      fsp.unlink(paths.dataPath).catch(() => undefined),
      fsp.unlink(paths.metaPath).catch(() => undefined)
    ])
  }
}

type RedisModule = {
  default: new (url: string) => any
}

type RedisTileCacheOptions = {
  client: any
  defaultTtlSeconds: number
  namespace?: string
}

class RedisTileCache implements TileCache {
  public readonly kind: TileCacheKind = 'redis'
  public readonly defaultTtlSeconds: number
  private readonly client: any
  private readonly namespace: string

  constructor(options: RedisTileCacheOptions) {
    this.client = options.client
    this.defaultTtlSeconds = options.defaultTtlSeconds
    this.namespace = options.namespace?.trim() || 'tiles'
  }

  async get(key: string): Promise<TileCacheEntry | null> {
    const namespacedKey = this.namespacedKey(key)
    try {
      const payload = await this.client.get(namespacedKey)
      if (!payload) {
        return null
      }

      const parsed = JSON.parse(payload) as FileCacheMetadata & { buffer: string }
      if (!parsed.buffer) {
        return null
      }

      const entry: TileCacheEntry = {
        buffer: Buffer.from(parsed.buffer, 'base64'),
        contentType: parsed.contentType,
        status: parsed.status
      }

      if (parsed.headers) {
        entry.headers = parsed.headers
      }

      return entry
    } catch (error) {
      console.warn('[tile-cache] Redis get failed:', (error as Error).message ?? error)
      return null
    }
  }

  async set(key: string, entry: TileCacheEntry, ttlSeconds?: number): Promise<void> {
    const namespacedKey = this.namespacedKey(key)
    const ttl = ttlSeconds && ttlSeconds > 0 ? ttlSeconds : this.defaultTtlSeconds
    const payloadData: Record<string, unknown> = {
      contentType: entry.contentType,
      status: entry.status,
      buffer: entry.buffer.toString('base64')
    }

    if (entry.headers) {
      payloadData['headers'] = entry.headers
    }

    const payload = JSON.stringify(payloadData)

    try {
      await this.client.set(namespacedKey, payload, 'EX', ttl)
    } catch (error) {
      console.warn('[tile-cache] Redis set failed:', (error as Error).message ?? error)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(this.namespacedKey(key))
    } catch (error) {
      console.warn('[tile-cache] Redis delete failed:', (error as Error).message ?? error)
    }
  }

  private namespacedKey(key: string): string {
    return `${this.namespace}:${hashKey(key)}`
  }
}

type TileCacheOptions = {
  enabled: boolean
  dir?: string
  defaultTtlSeconds?: number
  redisUrl?: string | null
  namespace?: string
  maxEntrySizeBytes?: number
}

const hashKey = (key: string) => crypto.createHash('sha1').update(key).digest('hex')

export const createTileCache = async (options: TileCacheOptions): Promise<TileCache | null> => {
  if (!options.enabled) {
    return null
  }

  const defaultTtl = options.defaultTtlSeconds && options.defaultTtlSeconds > 0
    ? options.defaultTtlSeconds
    : 3600

  const redisUrl = options.redisUrl?.trim() ?? null

  if (redisUrl) {
    try {
      const module = (await import('ioredis')) as RedisModule
      const RedisConstructor = module.default
      const client = new RedisConstructor(redisUrl)
      client.on('error', (error: Error) => {
        console.warn('[tile-cache] Redis client error:', error.message)
      })

      const redisOptions: RedisTileCacheOptions = {
        client,
        defaultTtlSeconds: defaultTtl
      }
      if (options.namespace) {
        redisOptions.namespace = options.namespace
      }

      return new RedisTileCache(redisOptions)
    } catch (error) {
      console.warn('[tile-cache] Failed to initialize Redis cache:', (error as Error).message ?? error)
      console.warn('[tile-cache] Falling back to filesystem cache.')
    }
  }

  const directory = options.dir?.trim() || path.join(process.cwd(), 'tile-cache')
  const fileOptions: FileTileCacheOptions = {
    directory,
    defaultTtlSeconds: defaultTtl
  }

  if (options.namespace) {
    fileOptions.namespace = options.namespace
  }
  if (options.maxEntrySizeBytes !== undefined) {
    fileOptions.maxEntrySizeBytes = options.maxEntrySizeBytes
  }

  return new FileTileCache(fileOptions)
}
