import * as libs from './libs'
import { count } from './core'

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

Promise.all(paths.map(str => count(str, {
  debug,
  includedFileExtensionNames,
  excludedDirectories,
}))).then(result => {
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
