/* eslint-disable style/max-len */
import path from 'node:path'

import type { ExtractorFileExtensions, TExtractInfoFromFile, TFileInfo, TGetCommonFilesInFileMap, TMonogenousUniversalMapEl } from './types'

import type { TUserChoices } from '@/cli'
import { getFileContentFromTxt } from '@/files'
import { PREFIX_FILE_FOLDER } from '@/shared/constants'
import { convertToApplyExtractorStatistics, convertToOutputUniversal } from '@/strategies/formatter'
import type { TDuplicateFormatTorrent, TDuplicateFormatTxt } from '@/strategies/torrent/types'

export const generateCombinationFolderName = (paths: readonly AbsolutePath[]): string => {
  const getFolderNameForPath = (path: AbsolutePath): string => {
    const isTorrent = path.endsWith('.torrent')

    if (isTorrent) return path.split('/').at(-2)!

    const [parentFolder, fileName] = path.split('/').slice(-2)
    return `${parentFolder}--${fileName?.split('.')[0]}`
  }

  return paths
    .map(getFolderNameForPath)
    .join('_')
}

export const extractOriginalFilename = (filename: string): Filename => {
  const [leftIdx, rightIdx] = [filename.indexOf('('), filename.indexOf(')')]

  const original = `${filename.slice(0, leftIdx)}${filename.slice(rightIdx + 1)}`.replace(/\s/g, '')

  return original
}

export const isIndirectDuplicateFilename = (allFilenames: readonly string[], filename: string): boolean => {
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

export const getFilesInfo = (pathOptions: Readonly<{ folder: string, filenames: string[] }>): Promise<TFileInfo[]> =>
  Promise.all(pathOptions.filenames.map(filename => extractInfoFromFile(path.join(pathOptions.folder, filename))))

export const processCombination = (
  filesMapCache: Record<AbsolutePath, TMonogenousUniversalMapEl>,
  folderOrFilenames: readonly string[]
): Record<string, string[]> => {
  // Get sorted files from the cache
  const files = folderOrFilenames
    .map(folderOrFilename => filesMapCache[folderOrFilename]!)
    .sort((a, b) => a.amount > b.amount ? 1 : -1)

  const [sourceMapEl, ...targetMapEls] = files

  // Process file map for current combination
  const fileMap = sourceMapEl!.content.reduce((acc, curFilename) => {
    const isDuplicate = targetMapEls.every(targetMapEl =>
      targetMapEl.content.includes(curFilename)
    )

    if (isDuplicate) {
      const pathsToDuplicateFiles = targetMapEls.map(targetMapEl =>
        targetMapEl.type === 'torrent'
          ? path.join(targetMapEl.folderOrFilename, curFilename)
          : targetMapEl.folderOrFilename
      )

      return {
        ...acc,
        [curFilename]: [
          sourceMapEl!.type === 'torrent'
            ? path.join(sourceMapEl!.folderOrFilename, curFilename)
            : sourceMapEl!.folderOrFilename,
          ...pathsToDuplicateFiles
        ]
      }
    }

    return acc
  }, {} as Record<Filename, AbsolutePath[]>)

  return fileMap
}

export const areAllTextFiles = (paths: readonly string[]): boolean => paths.every(path => path.endsWith('.txt'))

export const buildCommonFilesMap = (
  filesMapCache: Record<AbsolutePath, TMonogenousUniversalMapEl>,
  combinationsGenerator: Generator<readonly string[]>
): ReturnType<TGetCommonFilesInFileMap> => {
  const resultGenerator = function* (combinationsGenerator: Generator<readonly string[]>): Generator<Record<string, string[]>> {
    // eslint-disable-next-line functional/no-loop-statements
    for (const combination of combinationsGenerator) {
      const fileMap = processCombination(filesMapCache, combination)

      // eslint-disable-next-line functional/no-conditional-statements
      if (Object.keys(fileMap).length > 0) {
        yield fileMap
      }
    }
  }

  return [...resultGenerator(combinationsGenerator)]
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

export const mergeFileMapsExtraction = (fileMapsExtraction: readonly Record<string, string[]>[]): Record<string, string[]> => {
  const flattenFileMapsExtraction = fileMapsExtraction.flatMap((el) => {
    const keysOfCurrentRecord = Object.keys(el)
    const flattenRecordArr = keysOfCurrentRecord.map(key => ({
      [key]: el[key]!,
    }))
    return flattenRecordArr
  })

  const mergedFileMapsExtraction = flattenFileMapsExtraction.reduce(
    (acc, cur) => {
      const currentFilename = Object.keys(cur)[0]!
      const currentAbsolutePaths = Object.values(cur)[0]!

      return {
        ...acc,
        [currentFilename]:
          (acc[currentFilename]?.length || 0) > currentAbsolutePaths.length
            ? acc[currentFilename]!
            : currentAbsolutePaths,
      }
    },
    {} as Record<string, string[]>
  )

  return mergedFileMapsExtraction
}

export const getDuplicateStoragePath = (options: Readonly<TUserChoices>): AbsolutePath => {
  const rootPathToStorageFolder = (options.folderPath || options.folderPaths?.[0]) as string
  const absolutePathToStorageFolder = path.join(rootPathToStorageFolder, PREFIX_FILE_FOLDER)

  return absolutePathToStorageFolder
}

// eslint-disable-next-line functional/no-return-void
export const logExtractionStatistics = (fileMap: Record<string, string[]>, readonly: boolean): void => {
  console.table(convertToApplyExtractorStatistics(fileMap, { readonly }))
}
// eslint-disable-next-line functional/no-return-void
export const logUniversalStatistics = (duplicateMaps: readonly (TDuplicateFormatTorrent | TDuplicateFormatTxt)[], options: Readonly<TUserChoices>): void => {
  console.table(convertToOutputUniversal({ readonly: options.readonly })(
    options.fileExtensions.reduce(
      (acc, ext) => ({
        ...acc,
        [ext]: duplicateMaps[options.fileExtensions.indexOf(ext)],
      }),
      {} as { txt: TDuplicateFormatTxt, torrent: TDuplicateFormatTorrent }
    )
  ))
}
