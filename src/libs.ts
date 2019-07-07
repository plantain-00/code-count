import * as fs from 'fs'
import * as path from 'path'
import minimist from 'minimist'
import * as util from 'util'

export { fs, path, minimist }

export const statAsync = util.promisify(fs.stat)
export const readdirAsync = util.promisify(fs.readdir)
export const readFileAsync = util.promisify(fs.readFile)
