import fsSync from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import type { AbsolutePath, RelativePath, TGetUniqueNames } from '../types'

export const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const getUniqueNames: TGetUniqueNames = (sourceArr: string[]) => [...new Set(sourceArr)]
export const getAbsPathFolder = (...folders: RelativePath[]): AbsolutePath => path.resolve(__dirname, ...folders)

export const getAbsPathFolders = (folders: RelativePath[]): AbsolutePath[] =>
  folders.map(folder => getAbsPathFolder(folder))

export function validateUserArgs() {
  const userArgs = process.argv.slice(2)
  const readonlyIdx = userArgs.findIndex(arg => arg === '--readonly')

  let folders
  let readonly = true

  if (readonlyIdx !== -1) {
    const readonlyVal = userArgs[readonlyIdx + 1]

    if (readonlyVal === 'true') {
      readonly = true
    }
    else if (readonlyVal === 'false') {
      readonly = false
    }
    else {
      console.error('Invalid value for --readonly. It should either be true or false')
      process.exit(1)
    }

    readonlyIdx === 0 ? (folders = userArgs.slice(2)) : (folders = userArgs.slice(0, -2))
  }
  else {
    folders = userArgs
  }

  if (folders.length < 2) {
    console.error('Please provide at least 2 paths')
    process.exit(1)
  }

  if (folders.some(folder => !fsSync.existsSync(getAbsPathFolder(folder)))) {
    console.error(
      `Invalid paths: ${folders.filter(folder => !fsSync.existsSync(getAbsPathFolder(folder))).join(', ')}`
    )
    process.exit(1)
  }

  return { folders, readonly }
}
