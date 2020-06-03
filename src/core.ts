import * as libs from './libs'

/**
 * @public
 */
export interface Options {
  debug: boolean
  includedFileExtensionNames: string[]
  excludedDirectories: string[]
}

export async function count(path: string, options?: Partial<Options>): Promise<Result> {
  return read(path, true, options)
}

async function read(path: string, isRoot: boolean, options?: Partial<Options>): Promise<Result> {
  const stats = await libs.statAsync(path)
  if (stats && stats.isFile() && (isRoot || options?.includedFileExtensionNames?.includes(libs.path.extname(path)))) {
    return readFile(path, options?.debug)
  }
  if (stats && stats.isDirectory() && options?.excludedDirectories?.every(d => !path.endsWith(d))) {
    const files = await libs.readdirAsync(path)
    const result = await Promise.all(files.map(f => read(libs.path.resolve(path, f), false, options)))
    return result.reduce((p, c) => ({
      file: p.file + c.file,
      line: p.line + c.line,
      emptyLine: p.emptyLine + c.emptyLine,
      char: p.char + c.char
    }), {
        file: 0,
        line: 0,
        emptyLine: 0,
        char: 0
      })
  }
  return {
    file: 0,
    line: 0,
    emptyLine: 0,
    char: 0
  }
}

async function readFile(path: string, debug?: boolean) {
  const data = await libs.readFileAsync(path, 'utf8')
  const lines = data.split('\n')
  const line = lines.length
  const emptyLine = lines.filter(l => l.trim().length === 0).length
  if (debug) {
    console.log({
      path,
      emptyLine,
      line,
      char: data.length
    })
  }
  return { file: 1, line, emptyLine, char: data.length }
}

/**
 * @public
 */
export interface Result {
  file: number
  line: number
  emptyLine: number
  char: number
}

