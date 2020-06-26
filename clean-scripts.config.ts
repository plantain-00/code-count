import { checkGitStatus } from 'clean-scripts'

const tsFiles = `"src/**/*.ts"`

export default {
  build: [
    `rimraf dist/`,
    `tsc -p src`,
    `node dist/index.js . -i .ts -e node_modules,.git > spec/result.txt`
  ],
  lint: {
    ts: `eslint --ext .js,.ts ${tsFiles}`,
    export: `no-unused-export ${tsFiles}`,
    markdown: `markdownlint README.md`,
    typeCoverage: 'type-coverage -p src --strict'
  },
  test: [
    'clean-release --config clean-run.config.ts',
    () => checkGitStatus()
  ],
  fix: `eslint --ext .js,.ts ${tsFiles} --fix`
}
