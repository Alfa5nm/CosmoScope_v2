import 'dotenv/config'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

const resolveJavaExecutable = () => {
  if (process.env.CANTALOUPE_JAVA) {
    return process.env.CANTALOUPE_JAVA
  }
  if (process.env.JAVA_HOME) {
    const candidate = path.join(
      process.env.JAVA_HOME,
      'bin',
      process.platform === 'win32' ? 'java.exe' : 'java'
    )
    return candidate
  }
  return 'java'
}

const javaExecutable = resolveJavaExecutable()

const defaultJarLocations = [
  process.env.CANTALOUPE_JAR,
  path.resolve('cantaloupe-5.0.7.jar'),
  path.resolve('cantaloupe', 'cantaloupe-5.0.7.jar'),
  'D:/Softwares/cantaloupe-5.0.7_1/cantaloupe-5.0.7/cantaloupe-5.0.7.jar'
].filter(Boolean)

const jarPath = defaultJarLocations.find(candidate => candidate && fs.existsSync(candidate))

if (!jarPath) {
  console.error('[cantaloupe] Unable to locate Cantaloupe JAR.')
  console.error('  - Set CANTALOUPE_JAR in .env to the full path of cantaloupe-*.jar')
  console.error('  - Example: CANTALOUPE_JAR="D:/Tools/cantaloupe/cantaloupe-5.0.7.jar"')
  process.exit(1)
}

if (!fs.existsSync(javaExecutable)) {
  console.warn(`[cantaloupe] Java executable ${javaExecutable} not found. Falling back to system PATH.`)
}

const configPath = process.env.CANTALOUPE_CONFIG
  ? path.resolve(process.env.CANTALOUPE_CONFIG)
  : path.resolve('cantaloupe.properties')

const args = [
  `-Dcantaloupe.config=${configPath}`,
  '-Xmx2g',
  '-jar',
  jarPath
]

console.log(`[cantaloupe] Starting with ${javaExecutable}`)
console.log(`[cantaloupe] Config: ${configPath}`)
console.log(`[cantaloupe] Jar: ${jarPath}`)

const child = spawn(javaExecutable, args, { stdio: 'inherit' })

child.on('exit', (code) => {
  process.exit(code ?? 0)
})

child.on('error', (error) => {
  console.error('[cantaloupe] Failed to start:', error.message)
  process.exit(1)
})
