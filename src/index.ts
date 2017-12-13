import * as libs from "./libs";

const argv = libs.minimist(process.argv.slice(2), { "--": true });
const paths = argv._;

const exclude: string | string[] = argv.e || argv.exclude;
let excludedDirectories: string[] = [];
if (Array.isArray(exclude)) {
    for (const e of exclude) {
        excludedDirectories = excludedDirectories.concat(e.split(","));
    }
} else if (exclude) {
    excludedDirectories = excludedDirectories.concat(exclude.split(","));
}

const include: string | string[] = argv.i || argv.include;
let includedFileExtensionNames: string[] = [];
if (Array.isArray(include)) {
    for (const e of include) {
        includedFileExtensionNames = includedFileExtensionNames.concat(e.split(","));
    }
} else if (include) {
    includedFileExtensionNames = includedFileExtensionNames.concat(include.split(","));
}

const debug: boolean = argv.debug;

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
}, error => {
    if (error instanceof Error) {
        console.log(error.message);
    } else {
        console.log(error);
    }
    process.exit(1);
});
