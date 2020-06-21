import * as libs from './libs'
import { count } from './core'
import * as packageJson from '../package.json'

const argv = libs.minimist(process.argv.slice(2), { '--': true }) as unknown as {
  _: string[]
  v?: unknown
  version?: unknown
  h?: unknown
  help?: unknown
  i: string | string[]
  include: string | string[]
  e: string | string[]
  exclude: string | string[]
  debug?: boolean
}
const paths = argv._

function showToolVersion() {
  console.log(`Version: ${packageJson.version}`)
}

function showHelp() {
  console.log(`Version ${packageJson.version}
Syntax:   code-count [options] [file...]

Examples: code-count src/index.ts
          code-count . -i .ts -e node_modules,.git

Options:
 -h, --help                                         Print this message.
 -v, --version                                      Print the version
 -i, --include                                      File extension name, eg: ".ts,.html", repeatable
 -e, --exclude                                      Directories, eg: "node_modules,.git", repeatable
 --debug                                            Debug mode
`)
}

if (argv.v || argv.version) {
  showToolVersion()
  process.exit(0)
}

if (argv.h || argv.help) {
  showHelp()
  process.exit(0)
}

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

const debug = argv.debug

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
