import path from 'node:path'

import type { ExtractorFileExtensions, TExtractInfoFromFile, TGetCommonFilesInFileMap, TMonogenousUniversalMapEl } from './types'

import { getFileContentFromTxt } from '@/files'

export const generateCombinationFolderName = (...paths: AbsolutePath[]): string => paths.reduce((acc, curPath) => {
  let folderName = ''
  const isTorrent = curPath.endsWith('.torrent')

  if (isTorrent) {
    folderName = curPath.split('/').at(-2)!
  }
  else {
    const last2Paths = curPath.split('/').slice(-2)
    folderName = `${last2Paths[0]}--${last2Paths[1]?.split('.')[0]}`
  }
  return acc === '' ? folderName : `${acc}_${folderName}`
}, '')

export const extractOriginalFilename = (filename: string) => {
  const [leftIdx, rightIdx] = [filename.indexOf('('), filename.indexOf(')')]

  const original = `${filename.slice(0, leftIdx)}${filename.slice(rightIdx + 1)}`.replace(/\s/g, '')

  return original
}

// TODO: copy file
export const isIndirectDuplicateFilename = (allFilenames: string[], filename: string): boolean => {
  const isMaybeDuplicate = filename.includes('(')

  if (!isMaybeDuplicate) return false

  const originalFilename = extractOriginalFilename(filename)
  const originalFile = allFilenames.find(filename => filename === originalFilename)

  return Boolean(originalFile)
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

export const buildCommonFilesMap = (
  filesMapCache: Record<AbsolutePath, TMonogenousUniversalMapEl>,
  combinationsGenerator: Generator<string[]>
): ReturnType<TGetCommonFilesInFileMap> => {
  const result: ReturnType<TGetCommonFilesInFileMap> = []

  // Process combinations incrementally using the generator
  for (const folderOrFilenames of combinationsGenerator) {
    // Get sorted files from the cache
    const files = folderOrFilenames
      .map(folderOrFilename => filesMapCache[folderOrFilename]!)
      .sort((a, b) => a.amount > b.amount ? 1 : -1)

    const sourceMapEl = files[0]!
    const targetMapEls = files.slice(1)

    // Process file map for current combination
    const fileMap = sourceMapEl.content.reduce((acc, curFilename) => {
      const isDuplicate = targetMapEls.every(targetMapEl =>
        targetMapEl.content.includes(curFilename)
      )

      if (isDuplicate) {
        const pathsToDuplicateFiles = targetMapEls.map(targetMapEl =>
          targetMapEl.type === 'torrent'
            ? path.join(targetMapEl.folderOrFilename, curFilename)
            : targetMapEl.folderOrFilename
        )

        acc[curFilename] = [
          sourceMapEl.type === 'torrent'
            ? path.join(sourceMapEl.folderOrFilename, curFilename)
            : sourceMapEl.folderOrFilename,
          ...pathsToDuplicateFiles
        ]
      }
      return acc
    }, {} as ReturnType<TGetCommonFilesInFileMap>[0])

    // Only add non-empty entries to final result
    if (Object.keys(fileMap).length > 0) {
      result.push(fileMap)
    }
  }

  return result
}
