import * as fs from 'fs'
import * as path from 'path'
import minimist from 'minimist'
import * as util from 'util'

export { fs, path, minimist }

export function statAsync(file: string) {
  return new Promise<fs.Stats | undefined>((resolve) => {
    fs.stat(file, (error, stats) => {
      if (error) {
        resolve(undefined)
      } {
        resolve(stats)
      }
    })
  })
}
export const readdirAsync = util.promisify(fs.readdir)
export const readFileAsync = util.promisify(fs.readFile)
