import fsSync from 'node:fs';
import { getAbsPathFolder } from './files';

export function validateUserArgs() {
  const userArgs = process.argv.slice(2)
  const readonlyIdx = userArgs.findIndex(arg => arg === '--readonly')

  let folders
  let readonly = true

  if (readonlyIdx !== -1) {
    const readonlyVal = userArgs[readonlyIdx + 1]

    if (readonlyVal === 'true') {
      readonly = true
    } else if (readonlyVal === 'false') {
      readonly = false
    } else {
      console.error('Invalid value for --readonly. It should either be true or false')
      process.exit(1)
    }

    readonlyIdx === 0 ? (folders = userArgs.slice(2)) : (folders = userArgs.slice(0, -2))
  } else {
    folders = userArgs
  }


  if (folders.length < 2) {
    console.error('Please provide at least 2 paths')
    process.exit(1)
  }

  if (folders.some(folder => !fsSync.existsSync(getAbsPathFolder(folder)))) {
    console.error(`Invalid paths: ${folders.filter(folder => !fsSync.existsSync(getAbsPathFolder(folder))).join(', ')}`)
    process.exit(1)
  }

  return { folders, readonly }
}
