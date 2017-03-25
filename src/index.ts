import * as libs from "./libs";

const argv = libs.minimist(process.argv.slice(2), { "--": true });
const paths = argv["_"];
const excludedDirectories = ((argv["e"] || argv["exclude"]) as string).split(",");
const includedFileExtensionNames = ((argv["i"] || argv["include"]) as string).split(",");
const debug: boolean = argv["debug"];

function read(path: string) {
    return new Promise<{ line: number, char: number }>((resolve, reject) => {
        libs.fs.stat(path, (statError, stats) => {
            if (statError) {
                reject(statError);
                return;
            }
            if (stats.isFile() && includedFileExtensionNames.indexOf(libs.path.extname(path)) > -1) {
                libs.fs.readFile(path, "utf8", (readFileError, data) => {
                    if (readFileError) {
                        reject(readFileError);
                        return;
                    }
                    let line = 1;
                    for (const c of data) {
                        if (c === "\n") {
                            line++;
                        }
                    }
                    if (debug) {
                        console.log({
                            path,
                            line,
                            char: data.length,
                        });
                    }
                    resolve({ line, char: data.length });
                });
            } else if (stats.isDirectory() && excludedDirectories.every(d => !path.endsWith(d))) {
                libs.fs.readdir(path, (readDirError, files) => {
                    if (readDirError) {
                        reject(readDirError);
                        return;
                    }
                    Promise.all(files.map(f => read(libs.path.resolve(path, f)))).then(result => {
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
