import path from 'node:path'

import type { ExtractorFileExtensions, TExtractInfoFromFile } from './types'

import { getFileContentFromTxt } from '@/files'

export const generateCombinationFolderName = (...paths: AbsolutePath[]): string => paths.reduce((acc, curPath) => {
  let folderName = ''
  const isTorrent = curPath.endsWith('.torrent')

  if (isTorrent) {
    folderName = curPath.split('/').at(-2)!
  } else {
    const last2Paths = curPath.split('/').slice(-2)
    folderName =  `${last2Paths[0]}--${last2Paths[1]?.split('.')[0]}`

  }
  return acc === '' ? folderName : `${acc}_${folderName}`
}, '')

// TODO: copy file
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
