[![Dependency Status](https://david-dm.org/plantain-00/code-count.svg)](https://david-dm.org/plantain-00/code-count)
[![devDependency Status](https://david-dm.org/plantain-00/code-count/dev-status.svg)](https://david-dm.org/plantain-00/code-count#info=devDependencies)
[![Build Status: Linux](https://travis-ci.org/plantain-00/code-count.svg?branch=master)](https://travis-ci.org/plantain-00/code-count)
[![Build Status: Windows](https://ci.appveyor.com/api/projects/status/github/plantain-00/code-count?branch=master&svg=true)](https://ci.appveyor.com/project/plantain-00/code-count/branch/master)
[![npm version](https://badge.fury.io/js/code-count.svg)](https://badge.fury.io/js/code-count)
[![Downloads](https://img.shields.io/npm/dm/code-count.svg)](https://www.npmjs.com/package/code-count)

# code-count
A CLI tool to count code lines and characters.

#### install

`npm i code-count -g`

#### usage 

`code-count . -i .ts -e node_modules,.git`

#### options

key | description
--- | ---
-i,--include | file extension name, eg: ".ts,.html", repeatable
-e,--exclude | directories, eg: "node_modules,.git", repeatable
--debug | debug mode
