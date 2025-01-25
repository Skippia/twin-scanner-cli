import fsSync from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'

import type { TRemoveFilesEffect } from './types'

import { readDir } from '.'

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
    // console.warn('Error during moving file from', src, 'to', dest)
  }
}

export const appendIntoTxtFileEffect = async (filePath: AbsolutePath, content: string) => {
  await fs.appendFile(filePath, content, { encoding: 'utf-8' })
}

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

export const removeEmptyFoldersInFolderEffect = async (folderPath: AbsolutePath) => {
  try {
    const filesAndFolders = await readDir(folderPath)
    const onlyFolders = await (
      filesAndFolders.reduce(async (acc, fileOrFolder) => {
        const stat = await fs.stat(path.join(folderPath, fileOrFolder))

        if (stat.isDirectory()) return [...(await acc), path.join(folderPath, fileOrFolder)]

        return [...(await acc)]
      }, Promise.resolve([]) as Promise<AbsolutePath[]>)
    )

    for (const folder of onlyFolders) {
      const files = await fs.readdir(folder)

      if (files.length === 0) {
        await fs.rmdir(folder)
      }
    }
  }
  catch (error) {
    console.warn('Error during removing empty folder', folderPath)
  }
}
