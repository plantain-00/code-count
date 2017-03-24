import * as fs from "fs";
import * as path from "path";
import * as minimist from "minimist";

const argv = minimist(process.argv.slice(2), { "--": true });
const paths = argv["_"];
const excludedDirectories = ((argv["e"] || argv["exclude"]) as string).split(",");
const includedFileExtensionNames = ((argv["i"] || argv["include"]) as string).split(",");
const debug: boolean = argv["debug"];

function read(str: string) {
    return new Promise<{ line: number, char: number }>((resolve, reject) => {
        fs.stat(str, (statError, stats) => {
            if (statError) {
                reject(statError);
                return;
            }
            if (stats.isFile() && includedFileExtensionNames.indexOf(path.extname(str)) > -1) {
                fs.readFile(str, "utf8", (readFileError, data) => {
                    if (readFileError) {
                        reject(readFileError);
                        return;
                    }
                    let line = 0;
                    for (const c of data) {
                        if (c === "\n") {
                            line++;
                        }
                    }
                    if (debug) {
                        console.log({
                            path: str,
                            line,
                            char: data.length,
                        });
                    }
                    resolve({ line, char: data.length });
                });
            } else if (stats.isDirectory() && excludedDirectories.every(d => !str.endsWith(d))) {
                fs.readdir(str, (readDirError, files) => {
                    if (readDirError) {
                        reject(readDirError);
                        return;
                    }
                    Promise.all(files.map(f => read(path.resolve(str, f)))).then(result => {
                        resolve(result.reduce((p, c) => ({ line: p.line + c.line, char: p.char + c.char }), { line: 0, char: 0 }));
                    });
                });
            } else {
                resolve({ line: 0, char: 0 });
            }
        });
    });
}

Promise.all(paths.map(str => read(str))).then(result => {
    console.log(result.reduce((p, c) => ({ line: p.line + c.line, char: p.char + c.char }), { line: 0, char: 0 }));
});
