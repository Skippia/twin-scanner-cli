import path from 'node:path'

import { getFileContentFromTxt, writeIntoFile } from '../files'

import type { ExtractorFileExtensions, TExtractInfoFromFile, TUpdateContentInTxtFiles } from './types'

/**
 * @deprecated
 */
export const scanFiles = (parentFolder: string, filenames: string[]) => {
  const filenamesMap = new Set<string>()

  filenames.forEach((filename) => {
    const isDuplicateFilename = isIndirectDuplicateFilename(filenames, filename)

    if (isDuplicateFilename) filenamesMap.add(path.resolve(parentFolder, filename))
  })

  return filenamesMap
}

export const isIndirectDuplicateFilename = (allFilenames: string[], filename: string): boolean => {
  const isMaybeDuplicate = filename.includes('(')

  if (!isMaybeDuplicate) return false

  const originalFilename = extractOriginalFilename(filename)
  const originalFile = allFilenames.find(filename => filename === originalFilename)

  return Boolean(originalFile)
}

export const extractOriginalFilename = (filename: string) => {
  const [leftIdx, rightIdx] = [filename.indexOf('('), filename.indexOf(')')]

  const original = `${filename.slice(0, leftIdx)}${filename.slice(rightIdx + 1)}`.replace(/\s/g, '')

  return original
}

export const extractInfoFromFile: TExtractInfoFromFile = async (filePath) => {
  const ext = path.extname(filePath).slice(1) as ExtractorFileExtensions
  const filename = path.basename(filePath)
  const content = ext === 'txt' ? await getFileContentFromTxt(filePath) : null

  return {
    absolutePath: filePath,
    content,
    ext,
    filename,
  }
}

export const getFilesInfo = (pathOptions: { folder: string, filenames: string[] }) =>
  Promise.all(pathOptions.filenames.map(filename => extractInfoFromFile(path.join(pathOptions.folder, filename))))

export const updateContentInTxtFiles: TUpdateContentInTxtFiles = options => async (fileMap) => {
  if (options.readonly) return

  const writeToFilesTasks = Object.entries(fileMap).reduce<Promise<void>[]>((acc, [absolutePath, contentMap]) => {
    const writeToFileTask = writeIntoFile(absolutePath, contentMap.unique.join('\n'))

    acc.push(writeToFileTask)

    return acc
  }, [])

  await Promise.all(writeToFilesTasks)
}
