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
  combinationsGenerator: Generator<readonly string[]>
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

export function* getCombinationsGenerator(arr: readonly string[]): Generator<readonly string[]> {
  const n = arr.length

  // eslint-disable-next-line functional/no-loop-statements
  for (let k = n; k >= 2; k--) {
    yield * generateKLengthCombinations(arr, k)
  }
}

function* generateKLengthCombinations(
  arr: readonly string[],
  k: number
): Generator<readonly string[]> {
  function* backtrack(start: number, current: readonly string[]): Generator<readonly string[]> {
    if (current.length === k) {
      yield current
      return
    }

    // eslint-disable-next-line functional/no-loop-statements
    for (let i = start; i < arr.length; i++) {
      yield * backtrack(i + 1, [...current, arr[i]!])
    }
  }

  yield * backtrack(0, [])
}

export const getUniqueNames = (sourceArr: readonly string[]): readonly string[] => [
  ...new Set(sourceArr),
]

export const isOnlyDigits = (str?: string): boolean => (str ? /^\d+$/.test(str) : false)

export function filterRecordByKeys<T extends Record<string, unknown>>(
  record: Readonly<T>,
  keys: readonly string[]
): Readonly<T> {
  const filteredEntries = Object.entries(record)
    .filter(([key]) => keys.includes(key))

  return Object.fromEntries(filteredEntries) as T
}
