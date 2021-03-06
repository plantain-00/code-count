# code-count

[![Dependency Status](https://david-dm.org/plantain-00/code-count.svg)](https://david-dm.org/plantain-00/code-count)
[![devDependency Status](https://david-dm.org/plantain-00/code-count/dev-status.svg)](https://david-dm.org/plantain-00/code-count#info=devDependencies)
[![Build Status: Windows](https://ci.appveyor.com/api/projects/status/github/plantain-00/code-count?branch=master&svg=true)](https://ci.appveyor.com/project/plantain-00/code-count/branch/master)
![Github CI](https://github.com/plantain-00/code-count/workflows/Github%20CI/badge.svg)
[![npm version](https://badge.fury.io/js/code-count.svg)](https://badge.fury.io/js/code-count)
[![Downloads](https://img.shields.io/npm/dm/code-count.svg)](https://www.npmjs.com/package/code-count)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fplantain-00%2Fcode-count%2Fmaster%2Fpackage.json)](https://github.com/plantain-00/code-count)

A CLI tool to count code lines and characters.

## install

`yarn global add code-count`

## usage

`code-count . -i .ts -e node_modules,.git`

or `code-count src/index.ts`

## options

key | description
--- | ---
-i,--include | file extension name, eg: ".ts,.html", repeatable
-e,--exclude | directories, eg: "node_modules,.git", repeatable
--debug | debug mode
-h,--help | Print this message.
-v,--version | Print the version

## api

```ts
import { count } from 'code-count'

count('.', {
  includedFileExtensionNames: [ '.ts' ],
  excludedDirectories: [ 'node_modules', '.git' ]
})
```
