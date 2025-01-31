import fs from 'node:fs/promises'
import path from 'node:path'

import type { TGetRecursiveFilesAndFolders } from './types'

export const readDir = (folder: string): Promise<string[]> => fs.readdir(folder)
export const getFileContentFromTxt = (filePath: string): Promise<string> => fs.readFile(filePath, { encoding: 'utf-8' })

export const isNameInArrNames = ({ name, arrNames }: Readonly<{ name: string, arrNames: string[] }>): boolean =>
  arrNames.every(names => names.includes(name))

export const checkIsFolderExists = async (pathToFolder: AbsolutePath): Promise<boolean> => {
  try {
    return await fs.access(pathToFolder)
      .then(() => true)
  }
  catch (_err) {
    console.warn(`Folder ${pathToFolder} not exists`)
    return false
  }
}

export const checkIfDirectory = async (fullPath: AbsolutePath): Promise<boolean> =>
  (await fs.stat(fullPath)).isDirectory()

export const getRecursiveFilesAndFolders: TGetRecursiveFilesAndFolders = async (folder, options) => {
  const processEntry = async (
    entries: readonly string[],
    folders: readonly string[],
    files: readonly string[]
  ): Promise<{ folders: string[], files: string[] }> => {
    if (entries.length === 0) return { folders: [...folders], files: [...files] }

    const [currentEl, ...remainingEntries] = entries

    if (options.banFolders.includes(currentEl!)) {
      return await processEntry(remainingEntries, folders, files)
    }

    const fullPath = path.join(folder, currentEl!)
    const isDirectory = await checkIfDirectory(fullPath)

    if (isDirectory) {
      const childEntries = await fs.readdir(fullPath)
      const childEntriesFullPath = childEntries.map(child => path.join(currentEl!, child))

      return await processEntry(
        [...remainingEntries, ...childEntriesFullPath],
        [...folders, fullPath],
        files
      )
    }

    const isPermittedFile = options.permittedExtensions.some(ext => currentEl!.endsWith(`.${ext}`))
    return isPermittedFile
      ? await processEntry(remainingEntries, folders, [...files, fullPath])
      : await processEntry(remainingEntries, folders, files)
  }

  const initialEntries = await fs.readdir(folder)
  const { folders, files } = await processEntry(initialEntries, [], [])
  return options.flat
    ? [...folders, ...files]
    : { folders, files }
}
