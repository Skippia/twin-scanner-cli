import fs from 'node:fs/promises'
import path from 'node:path'

import type { TGetRecursiveFilesAndFolders } from './types'

export const readDir = (folder: string) => fs.readdir(folder)
export const getFileContentFromTxt = (filePath: string): Promise<string> => fs.readFile(filePath, { encoding: 'utf-8' })

export const isNameInArrNames = ({ name, arrNames }: { name: string, arrNames: string[] }) =>
  arrNames.every(names => names.includes(name))

export const checkIsFolderExists = async (pathToFolder: AbsolutePath) => {
  try {
    await fs.access(pathToFolder)
    return true
  }
  catch (err) {
    console.error(`Folder ${pathToFolder} not exists`)
    return false
  }
}

export const getRecursiveFilesAndFolders: TGetRecursiveFilesAndFolders = async (folder, options) => {
  const folders: string[] = []
  const files: string[] = []
  const topLevelFiles = [...(await fs.readdir(folder))]

  while (topLevelFiles.length > 0) {
    const el = topLevelFiles.shift()!

    if (options.banFolders.includes(el)) continue

    const isFolder = (await fs.stat(path.join(folder, el))).isDirectory()

    if (isFolder) {
      folders.push(path.join(folder, el))
      const deeperFilesRelative = await fs.readdir(path.join(folder, el))
      const deeperFilesAbsolute = deeperFilesRelative.map(name => path.join(el, name))

      topLevelFiles.push(...deeperFilesAbsolute)
      continue
    }

    const isPermittedFile = options.permittedExtensions.some(ext => el.endsWith(`.${ext}`))

    if (isPermittedFile) {
      files.push(path.join(folder, el))
    }
  }

  return options.flat
    ? [...folders, ...files]
    : {
        folders,
        files,
      }
}
