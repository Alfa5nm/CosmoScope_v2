declare module 'ioredis' {
  export default class IORedis {
    constructor(connection?: string)
    on(event: string, listener: (...args: any[]) => void): this
    get(key: string): Promise<string | null>
    set(key: string, value: string, ...args: any[]): Promise<any>
    del(key: string): Promise<number>
  }
}
