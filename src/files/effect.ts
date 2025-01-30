import fsSync from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'

import type { TRemoveFilesEffect } from './types'

import { checkIfDirectory, readDir } from '.'

export const removeFilesEffect: TRemoveFilesEffect = options => async (filenamePaths) => {
  if (options.readonly) return

  const removeFilesTasks = filenamePaths.map(filenamePath => fs.unlink(filenamePath))

  return await Promise.all(removeFilesTasks)
}

export const createFolderEffect = (folderPath: AbsolutePath) => fs.mkdir(folderPath, { recursive: true })

export const writeIntoFileEffect = (filePath: string, content: string) => fs.writeFile(filePath, content, { encoding: 'utf-8' })

export const moveFileEffect = async (src: AbsolutePath, dest: AbsolutePath) => {
  try {
    return await fs.rename(src, dest)
  }
  catch (err) {
    // console.warn('Error during moving file from', src, 'to', dest)
  }
}

export const appendIntoTxtFileEffect = async (filePath: AbsolutePath, content: string) =>
  await fs.appendFile(filePath, content, { encoding: 'utf-8' })

// TODO: Refactor
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

// TODO: Refactor
export const removeEmptyFoldersInFolderEffect1 = async (folderPath: AbsolutePath) => {
  try {
    const filesAndFolders = await readDir(folderPath)
    const onlyFolders = await filesAndFolders.reduce(
      async (acc, fileOrFolder) => {
        const fullPath = path.join(folderPath, fileOrFolder)
        const isDirectory = await checkIfDirectory(fullPath)

        if (isDirectory) return [...(await acc), fullPath]

        return [...(await acc)]
      },
      Promise.resolve([]) as Promise<AbsolutePath[]>
    )

    // eslint-disable-next-line functional/no-loop-statements
    for (const folder of onlyFolders) {
      const files = await fs.readdir(folder)

      // eslint-disable-next-line functional/no-conditional-statements
      if (files.length === 0) {
        // eslint-disable-next-line functional/no-expression-statements
        await fs.rmdir(folder)
      }
    }
  }
  catch (error) {
    console.warn('Error during removing empty folder', folderPath)
  }
}

export const removeEmptyFoldersInFolderEffect = async (folderPath: AbsolutePath) => {
  const processFolders = async (folders: readonly AbsolutePath[]): Promise<void> => {
    if (folders.length === 0) return

    const [current, ...remaining] = folders
    const files = await fs.readdir(current!)

    // eslint-disable-next-line functional/no-conditional-statements
    if (files.length === 0) {
      // eslint-disable-next-line functional/no-expression-statements
      await fs.rmdir(current!)
    }

    return await processFolders(remaining)
  }

  try {
    const entries = await readDir(folderPath)

    const onlyFolders = await (
      entries.reduce(async (acc, fileOrFolder) => {
        const fullPath = path.join(folderPath, fileOrFolder)
        const isFolder = await checkIfDirectory(fullPath)

        return isFolder ? [...(await acc), fullPath] : (await acc)
      }, Promise.resolve([] as string[]))
    )

    return await processFolders(onlyFolders)
  }
  catch (error) {
    console.warn('Error during removing empty folder', folderPath)
  }
}
