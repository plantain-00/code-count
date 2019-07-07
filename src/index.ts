import * as libs from './libs'

const argv = libs.minimist(process.argv.slice(2), { '--': true })
const paths = argv._

const exclude: string | string[] = argv.e || argv.exclude
let excludedDirectories: string[] = []
if (Array.isArray(exclude)) {
  for (const e of exclude) {
    excludedDirectories = excludedDirectories.concat(e.split(','))
  }
} else if (exclude) {
  excludedDirectories = excludedDirectories.concat(exclude.split(','))
}

const include: string | string[] = argv.i || argv.include
let includedFileExtensionNames: string[] = []
if (Array.isArray(include)) {
  for (const e of include) {
    includedFileExtensionNames = includedFileExtensionNames.concat(e.split(','))
  }
} else if (include) {
  includedFileExtensionNames = includedFileExtensionNames.concat(include.split(','))
}

const debug: boolean = argv.debug

async function read(path: string, isRoot: boolean): Promise<Result> {
  const stats = await libs.statAsync(path)
  if (stats.isFile() && (isRoot || includedFileExtensionNames.includes(libs.path.extname(path)))) {
    return readFile(path)
  }
  if (stats.isDirectory() && excludedDirectories.every(d => !path.endsWith(d))) {
    const files = await libs.readdirAsync(path)
    const result = await Promise.all(files.map(f => read(libs.path.resolve(path, f), false)))
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

async function readFile(path: string) {
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

Promise.all(paths.map(str => read(str, true))).then(result => {
  console.log(result.reduce((p, c) => ({
    file: p.file + c.file,
    line: p.line + c.line,
    emptyLine: p.emptyLine + c.emptyLine,
    char: p.char + c.char
  }), {
      file: 0,
      line: 0,
      emptyLine: 0,
      char: 0
    }))
}, error => {
  if (error instanceof Error) {
    console.log(error.message)
  } else {
    console.log(error)
  }
  process.exit(1)
})

interface Result {
  file: number
  line: number
  emptyLine: number
  char: number
}
