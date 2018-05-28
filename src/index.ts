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

// tslint:disable-next-line:cognitive-complexity
function read(path: string, isRoot: boolean) {
  return new Promise<Result>((resolve, reject) => {
    libs.fs.stat(path, (statError, stats) => {
      if (statError) {
        reject(statError)
        return
      }
      if (stats.isFile() && (isRoot || includedFileExtensionNames.includes(libs.path.extname(path)))) {
        readFile(path).then(result => resolve(result), error => reject(error))
      } else if (stats.isDirectory() && excludedDirectories.every(d => !path.endsWith(d))) {
        libs.fs.readdir(path, (readDirError, files) => {
          if (readDirError) {
            reject(readDirError)
            return
          }
          Promise.all(files.map(f => read(libs.path.resolve(path, f), false))).then(result => {
            resolve(result.reduce((p, c) => ({ file: p.file + c.file, line: p.line + c.line, char: p.char + c.char }), { file: 0, line: 0, char: 0 }))
          })
        })
      } else {
        resolve({ file: 0, line: 0, char: 0 })
      }
    })
  })
}

function readFile(path: string) {
  return new Promise<Result>((resolve, reject) => {
    libs.fs.readFile(path, 'utf8', (readFileError, data) => {
      if (readFileError) {
        reject(readFileError)
        return
      }
      let line = 1
      for (const c of data) {
        if (c === '\n') {
          line++
        }
      }
      if (debug) {
        console.log({
          path,
          line,
          char: data.length
        })
      }
      resolve({ file: 1, line, char: data.length })
    })
  })
}

Promise.all(paths.map(str => read(str, true))).then(result => {
  console.log(result.reduce((p, c) => ({ file: p.file + c.file, line: p.line + c.line, char: p.char + c.char }), { file: 0, line: 0, char: 0 }))
}, error => {
  if (error instanceof Error) {
    console.log(error.message)
  } else {
    console.log(error)
  }
  process.exit(1)
})

type Result = {
  file: number
  line: number
  char: number
}
