import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type {
  AbsolutePath,
  RelativePath,
  TConvertToOutput,
  TExtensionsRemoveDuplicatesStrategies,
  TExtractorsUsefulInfo,
  TGetUniqueNames,
  TUpdateContentInTxtFiles,
} from './types'

export const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const getAbsPathFolder = (...folders: RelativePath[]): AbsolutePath => path.resolve(__dirname, ...folders)
export const getAbsPathFolders = (folders: RelativePath[]): AbsolutePath[] =>
  folders.map(folder => getAbsPathFolder(folder))

export const createFolder = (relativeFolder: string) => fs.mkdir(getAbsPathFolder(relativeFolder), { recursive: true })

export const isIndirectDuplicateFilename = (allFilenames: string[], filename: string): boolean =>
  filename.includes('(')
    ? Boolean(allFilenames.find(filename => filename === extractOriginalFilename(filename)))
    : false

export const extractOriginalFilename = (filename: string) => {
  const [leftIdx, rightIdx] = [filename.indexOf('('), filename.indexOf(')')]
  return filename.slice(0, leftIdx).concat(filename.slice(rightIdx))
}

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

export const getFileNamesForFolder = async (relativePath: string): Promise<string[]> => {
  try {
    return fs.readdir(getAbsPathFolder(relativePath))
  }
  catch (err) {
    console.error(`Folder ${relativePath} not exists`)
    throw err
  }
}

export const getAllFilesInFolder = (folders: string[]) =>
  Promise.all(
    folders.map(async folder => ({
      parentFolder: folder,
      filenames: await getFileNamesForFolder(folder),
    }))
  )

export const scanFiles = (parentFolder: string, filenames: string[]) => {
  const filenamesMap = new Set<string>()

  filenames.forEach((filename) => {
    const isDuplicateFilename = isIndirectDuplicateFilename(filenames, filename)

    if (isDuplicateFilename) filenamesMap.add(path.resolve(parentFolder, filename))
  })

  return filenamesMap
}

export const getUniqueNames: TGetUniqueNames = (sourceArr: string[]) => [...new Set(sourceArr)]

export const extractors: TExtractorsUsefulInfo = {
  txt: file => file.content?.split('\n').filter(v => Boolean(v)) || [''],
  torrent: file => file.filename,
}

export const txtDuplicateStrategy: TExtensionsRemoveDuplicatesStrategies['txt'] = {
  extractor: extractors.txt,
  getUniqueNames: lines => getUniqueNames(lines),
  getDuplicates: lines =>
    lines.reduce<string[]>(
      (acc, cur, idx) => (lines.indexOf(cur, idx) !== lines.lastIndexOf(cur) ? [...acc, cur] : [...acc]),
      []
    ),
}

export const torrentDuplicateStrategy: TExtensionsRemoveDuplicatesStrategies['torrent'] = {
  extractor: extractors.torrent,
  isConsideredDuplicate: filenames => curFile => isIndirectDuplicateFilename(filenames, curFile.filename),
}

export const updateContentInTxtFiles: TUpdateContentInTxtFiles = options => async (fileMap) => {
  if (options.readonly) return

  const writeToFilesTasks = Object.entries(fileMap).reduce<Promise<void>[]>((acc, [absolutePath, contentMap]) => {
    const writeToFileTask = fs.writeFile(absolutePath, contentMap.unique.join('\n'), {
      encoding: 'utf-8',
    })

    acc.push(writeToFileTask)

    return acc
  }, [])

  await Promise.all(writeToFilesTasks)
}

export const convertToOutput: TConvertToOutput = options => raw =>
  raw.flatMap(val =>
    Object.entries(val).map(([absolutePath, ctx]) => ({
      filename: path.basename(absolutePath),
      amount_all_names: ctx.duplicatesLength + ctx.uniqueLength,
      amount_unique_names: ctx.uniqueLength,
      amount_duplicates_names: ctx.duplicatesLength,
      readonlyMode: options.readonly,
    }))
  )
