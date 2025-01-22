import fsSync from 'node:fs'
import fs from 'node:fs/promises'

import type { TRemoveFilesEffect } from './types'

export const removeFilesEffect: TRemoveFilesEffect = options => async (filenamePaths) => {
  if (options.readonly) return

  const removeFilesTasks = filenamePaths.map(filenamePath => fs.unlink(filenamePath))

  await Promise.all(removeFilesTasks)
}

export const createFolderEffect = (folderPath: AbsolutePath) => fs.mkdir(folderPath, { recursive: true })

export const writeIntoFileEffect = (filePath: string, content: string) =>
  fs.writeFile(filePath, content, { encoding: 'utf-8' })

export const moveFileEffect = async (src: AbsolutePath, dest: AbsolutePath) => {
  try {
    await fs.rename(src, dest)
  }
  catch (err) {
    console.warn('Error during moving file from', src, 'to', dest)
  }
}

export const appendIntoTxtFileEffect = (filePath: AbsolutePath, content: string) =>
  fs.appendFile(filePath, content, { encoding: 'utf-8' })

export const validateFolderPath = (folderPath: string): boolean | string => {
  try {
    return fsSync.existsSync(folderPath) && fsSync.lstatSync(folderPath).isDirectory()
      ? true
      : 'Please provide a valid folder path'
  }
  catch (error) {
    return 'Please provide a valid folder path'
  }
}
