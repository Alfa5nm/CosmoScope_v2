#!/usr/bin/env node
import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { promises as fsp } from 'fs'
import path from 'path'
import os from 'os'

const [, , rawCommand, ...rawArgs] = process.argv

const helpText = \nUsage:\n  node scripts/prepare-raster.mjs <command> [options]\n\nCommands:\n  pyramid   Convert a GeoTIFF into a tile pyramid using GDAL\n  iiif      Generate an IIIF-compatible pyramid using libvips (dzsave)\n\nExamples:\n  node scripts/prepare-raster.mjs pyramid --source data/world.tif --output build/tiles --min-zoom 0 --max-zoom 10\n  node scripts/prepare-raster.mjs iiif --source data/moon.tif --output build/moon-iiif\n\nOptions:\n  --source <path>       Input GeoTIFF (required)\n  --output <path>       Output directory (default: ./build/<command>-output)\n  --min-zoom <number>   Minimum zoom level for gdal2tiles\n  --max-zoom <number>   Maximum zoom level for gdal2tiles\n  --tile-size <number>  Tile size in pixels (default: 256 for pyramid, 512 for IIIF)\n  --skip-cog            Skip intermediate COG generation step\n  --help                Show this message\n

if (!rawCommand || rawCommand === '--help' || rawCommand === '-h') {
  process.stdout.write(helpText)
  process.exit(0)
}

const command = rawCommand.toLowerCase()

const parseFlags = (args) => {
  const flags = {}
  for (let i = 0; i < args.length; i += 1) {
    const token = args[i]
    if (!token.startsWith('--')) {
      continue
    }

    const key = token.slice(2)
    const next = args[i + 1]
    if (!next || next.startsWith('--')) {
      flags[key] = true
      continue
    }

    flags[key] = next
    i += 1
  }
  return flags
}

const flags = parseFlags(rawArgs)

const ensure = (condition, message) => {
  if (!condition) {
    process.stderr.write(\n[prepare-raster] \n\n)
    process.exit(1)
  }
}

ensure(['pyramid', 'iiif'].includes(command), Unknown command "". Use --help for usage.)
ensure(typeof flags.source === 'string', 'Missing required --source <path> argument')

const sourcePath = path.resolve(String(flags.source))
ensure(existsSync(sourcePath), Source file not found: )

const defaultOutput = path.resolve(
  typeof flags.output === 'string'
    ? flags.output
    : path.join('build', ${command}-output)
)

const minZoom = flags['min-zoom'] !== undefined ? Number(flags['min-zoom']) : undefined
const maxZoom = flags['max-zoom'] !== undefined ? Number(flags['max-zoom']) : undefined
const tileSize = flags['tile-size'] ? Number(flags['tile-size']) : command === 'iiif' ? 512 : 256
const skipCog = Boolean(flags['skip-cog'])

const runStep = (label, executable, args) =>
  new Promise((resolve, reject) => {
    process.stdout.write(\n[prepare-raster] \n  $  \n)
    const child = spawn(executable, args, { stdio: 'inherit' })
    child.on('error', error => {
      reject(new Error(${executable} failed: ))
    })
    child.on('exit', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(${executable} exited with code ))
      }
    })
  })

const ensureDir = async (dir) => {
  await fsp.mkdir(dir, { recursive: true })
}

const checkTool = async (tool, args = ['--version']) => {
  try {
    await runStep(Checking for , tool, args)
    return true
  } catch (error) {
    process.stderr.write(\n[prepare-raster] Missing dependency: . Install it and re-run.\n)
    return false
  }
}

const runPyramid = async () => {
  const hasGdalTranslate = await checkTool('gdal_translate')
  let gdal2tilesExecutable = 'gdal2tiles.py'
  let hasGdal2Tiles = await checkTool(gdal2tilesExecutable, ['--version'])
  if (!hasGdal2Tiles) {
    gdal2tilesExecutable = 'gdal2tiles'
    hasGdal2Tiles = await checkTool(gdal2tilesExecutable, ['--version'])
  }
  ensure(hasGdalTranslate && hasGdal2Tiles, 'GDAL utilities are required for the pyramid command')

  await ensureDir(defaultOutput)

  const workingDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'raster-cog-'))
  const cogPath = path.join(workingDir, ${path.parse(sourcePath).name}-cog.tif)

  if (!skipCog) {
    const translateArgs = [
      '-of', 'COG',
      '-co', 'COMPRESS=DEFLATE',
      sourcePath,
      cogPath
    ]
    await runStep('Generating cloud-optimized GeoTIFF', 'gdal_translate', translateArgs)
  }

  const inputForTiles = skipCog ? sourcePath : cogPath
  const tilesArgs = ['--processes=4', '--tilesize', String(tileSize)]

  if (Number.isFinite(minZoom) || Number.isFinite(maxZoom)) {
    const zoomParts = []
    if (Number.isFinite(minZoom)) {
      zoomParts.push(String(minZoom))
    }
    if (Number.isFinite(maxZoom)) {
      zoomParts.push(String(maxZoom))
    }
    if (zoomParts.length > 0) {
      tilesArgs.push('-z', zoomParts.join('-'))
    }
  }

  tilesArgs.push(inputForTiles, defaultOutput)
  await runStep('Building tile pyramid', gdal2tilesExecutable, tilesArgs)

  process.stdout.write(\n[prepare-raster] Tile pyramid ready at \n)
}

const runIiif = async () => {
  const hasVips = await checkTool('vips')
  ensure(hasVips, 'libvips (vips command) is required for the iiif command')

  await ensureDir(defaultOutput)
  const dzArgs = [
    'dzsave',
    sourcePath,
    defaultOutput,
    '--suffix', '.jpg',
    '--tile-size', String(tileSize),
    '--layout', 'iiif',
    '--centre',
    '--overlap', '0'
  ]

  await runStep('Generating IIIF pyramid', 'vips', dzArgs)

  process.stdout.write(\n[prepare-raster] IIIF tiles ready at \n)
  process.stdout.write([prepare-raster] Add  to your IIIF server (e.g. Cantaloupe) and update layer configuration.\n)
}

try {
  if (command === 'pyramid') {
    await runPyramid()
  } else if (command === 'iiif') {
    await runIiif()
  }
} catch (error) {
  process.stderr.write(\n[prepare-raster] \n)
  process.exit(1)
}
