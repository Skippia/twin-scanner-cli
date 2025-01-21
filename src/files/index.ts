import fs from 'node:fs/promises'
import path from 'node:path'

import { getAbsPathFolder } from '../helpers'

import type { TRemoveFiles } from './types'

export const createFolder = (relativeFolder: string) => fs.mkdir(getAbsPathFolder(relativeFolder), { recursive: true })
export const readDir = (folder: string) => fs.readdir(folder)
export const getFileContentFromTxt = (filePath: string): Promise<string> => fs.readFile(filePath, { encoding: 'utf-8' })

export const writeIntoFile = (filePath: string, content: string) =>
  fs.writeFile(filePath, content, { encoding: 'utf-8' })

export const moveFiles = async ({
  filenamePaths,
  destRelativeFolder,
}: {
  filenamePaths: string[]
  destRelativeFolder: string
}) => {
  if (!(await checkIsFolderExists(destRelativeFolder))) {
    console.log('Create folder:', getAbsPathFolder(destRelativeFolder))
    await createFolder(destRelativeFolder)
  }

  await Promise.all(
    filenamePaths.map(filename => fs.rename(filename, getAbsPathFolder(destRelativeFolder, path.basename(filename))))
  )
}

export const filenameIsInAllFolders = ({
  filename,
  fileMap,
}: {
  filename: string
  fileMap: Record<string, string[]>
}) => Object.values(fileMap).every(filenames => filenames.includes(filename))

export const checkIsFolderExists = async (pathToFolder: string) => {
  const fullPath = getAbsPathFolder(pathToFolder)
  try {
    await fs.access(fullPath)
    return true
  }
  catch (err) {
    console.error(`Folder ${fullPath} not exists`)
    return false
  }
}

/**
 * @deprecated
 */
export const getFileNamesForFolder = async (relativePath: string): Promise<string[]> =>
  await readDir(getAbsPathFolder(relativePath))

export const getAllFilesInFolder = (folders: string[]) =>
  Promise.all(
    folders.map(async folder => ({
      parentFolder: folder,
      filenames: await getFileNamesForFolder(folder),
    }))
  )

export const removeFiles: TRemoveFiles = options => async (filenamePaths) => {
  if (options.readonly) return

  const removeFilesTasks = filenamePaths.map(filenamePath => fs.unlink(filenamePath))

  await Promise.all(removeFilesTasks)
}
