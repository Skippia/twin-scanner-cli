import path from 'node:path'

import type { ExtractorFileExtensions, TExtractInfoFromFile } from './types'

import { getFileContentFromTxt } from '@/files'

export const generateCombinationFolderName = (path1: AbsolutePath, path2: AbsolutePath): string => {
  const folderName1 = path1.endsWith('.torrent') ? path1.split('/').at(-2) : path1.split('/').at(-1)?.split('.')[0]
  const folderName2 = path2.endsWith('.torrent') ? path2.split('/').at(-2) : path2.split('/').at(-1)?.split('.')[0]
  return `${folderName1}_${folderName2}`
}

// TODO: copy file
export const isIndirectDuplicateFilename = (allFilenames: string[], filename: string): boolean => {
  const isMaybeDuplicate = filename.includes('(')

  if (!isMaybeDuplicate) return false

  const originalFilename = extractOriginalFilename(filename)
  const originalFile = allFilenames.find((filename) => filename === originalFilename)

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

export const getFilesInfo = (pathOptions: { folder: string; filenames: string[] }) =>
  Promise.all(pathOptions.filenames.map((filename) => extractInfoFromFile(path.join(pathOptions.folder, filename))))
