import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AbsolutePath, RelativePath } from './types';

export const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const getAbsPathFolder = (...folders: RelativePath[]): AbsolutePath => path.resolve(__dirname, ...folders)
export const getAbsPathFolders = (folders: RelativePath[]): AbsolutePath[] => folders.map(folder => getAbsPathFolder(folder))

export const createFolder = (relativeFolder: string) => fs.mkdir(getAbsPathFolder(relativeFolder), { recursive: true })

export const checkIfDuplicateFilename = (allFilenames: string[], filename: string) =>
  filename.includes('(') ? (allFilenames.find(filename => filename === extractOriginalFilename(filename))) : false

export const extractOriginalFilename = (filename: string) => {
  const [leftIdx, rightIdx] = [filename.indexOf('('), filename.indexOf(')')]
  return filename.slice(0, leftIdx).concat(filename.slice(rightIdx))
}

export const moveFiles = async ({ filenamePaths, destRelativeFolder }: { filenamePaths: string[], destRelativeFolder: string }) => {
  if (!(await checkIsFolderExists(destRelativeFolder))) {
    console.log('Create folder:', getAbsPathFolder(destRelativeFolder))
    await createFolder(destRelativeFolder)
  }

  await Promise.all(
    filenamePaths.map(filename => fs.rename(filename, getAbsPathFolder(destRelativeFolder, path.basename(filename))))
  )
}

export const filenameIsInAllFolders = ({ filename, fileMap }: { filename: string, fileMap: Record<string, string[]> }) =>
  Object.values(fileMap).every(filenames => filenames.includes(filename))

export const checkIsFolderExists = async (pathToFolder: string) => {
  const fullPath = getAbsPathFolder(pathToFolder)
  try {
    await fs.access(fullPath)
    return true
  } catch (err) {
    console.error(`Folder ${fullPath} not exists`)
    return false
  }
}

export const getFileNamesForFolder = async (relativePath: string): Promise<string[]> => {
  try {
    return fs.readdir(getAbsPathFolder(relativePath))
  } catch (err) {
    console.error(`Folder ${relativePath} not exists`)
    throw err
  }
}

export const getAllFilesInFolder = (folders: string[]) =>
  Promise.all(folders.map(async (folder) =>
    ({ parentFolder: folder, filenames: await getFileNamesForFolder(folder) })
  ))

export const scanFiles = (parentFolder: string, filenames: string[]) => {
  const filenamesMap = new Set<string>()

  filenames.forEach(filename => {
    const isDuplicateFilename = checkIfDuplicateFilename(filenames, filename)

    if (isDuplicateFilename) filenamesMap.add(path.resolve(parentFolder, filename))
  })

  return filenamesMap
}
