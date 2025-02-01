import path from 'node:path'

import type {
  ExtractorFileExtensions,
  TExtractInfoFromFile,
  TFileInfo,
  TGetCommonFilesInFileMap,
  TMonogenousUniversalMapEl,
} from './types'

import type { TUserChoices } from '@/cli'
import { getFileContentFromTxt } from '@/files/readers'
import { PREFIX_FILE_FOLDER } from '@/shared/constants'
import { convertToApplyExtractorStatistics, convertToOutputUniversal } from '@/strategies/formatter'
import type { TDuplicateFormatTorrent, TDuplicateFormatTxt } from '@/strategies/torrent/types'

export const generateCombinationFolderName = (paths: ReadonlyArray<AbsolutePath>): string => {
  const getFolderNameForPath = (path: AbsolutePath): string => {
    const isTorrent = path.endsWith('.torrent')

    if (isTorrent) return path.split('/').at(-2)!

    const [parentFolder, fileName] = path.split('/').slice(-2)
    return `${parentFolder}--${fileName?.split('.')[0]}`
  }

  return paths.map(getFolderNameForPath).join('_')
}

export const extractOriginalFilename = (filename: string): Filename => {
  const [leftIdx, rightIdx] = [filename.indexOf('('), filename.indexOf(')')]

  const original = `${filename.slice(0, leftIdx)}${filename.slice(rightIdx + 1)}`.replace(/\s/g, '')

  return original
}

export const isIndirectDuplicateFilename = (allFilenames: ReadonlyArray<string>, filename: string): boolean => {
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

export const getFilesInfo = (pathOptions: {
  readonly folder: string
  readonly filenames: ReadonlyArray<string>
}): Promise<ReadonlyArray<TFileInfo>> =>
  Promise.all(pathOptions.filenames.map(filename => extractInfoFromFile(path.join(pathOptions.folder, filename))))

export const processCombination = (
  filesMapCache: { readonly [key: AbsolutePath]: TMonogenousUniversalMapEl },
  folderOrFilenames: ReadonlyArray<string>
): { [key: string]: ReadonlyArray<string> } => {
  // Get sorted files from the cache
  const files = folderOrFilenames
    .map(folderOrFilename => filesMapCache[folderOrFilename]!)
    .sort((a, b) => (a.amount > b.amount ? 1 : -1))

  const [sourceMapEl, ...targetMapEls] = files

  // Process file map for current combination
  const fileMap = sourceMapEl!.content.reduce(
    (acc, curFilename) => {
      const isDuplicate = targetMapEls.every(targetMapEl => targetMapEl.content.includes(curFilename))

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
            ...pathsToDuplicateFiles,
          ],
        }
      }

      return acc
    },
    {} as { readonly [key: Filename]: ReadonlyArray<AbsolutePath> }
  )

  return fileMap
}

export const areAllTextFiles = (paths: ReadonlyArray<string>): boolean => paths.every(path => path.endsWith('.txt'))

export const buildCommonFilesMap = (
  filesMapCache: { readonly [key: AbsolutePath]: TMonogenousUniversalMapEl },
  combinationsGenerator: Generator<ReadonlyArray<string>>
): ReturnType<TGetCommonFilesInFileMap> => {
  const resultGenerator = function* (
    combinationsGenerator: Generator<ReadonlyArray<string>>
  ): Generator<{ [key: string]: ReadonlyArray<string> }> {
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

export function* getCombinationsGenerator(arr: ReadonlyArray<string>): Generator<ReadonlyArray<string>> {
  const n = arr.length

  // eslint-disable-next-line functional/no-loop-statements, functional/no-let
  for (let k = n; k >= 2; k--) {
    yield * generateKLengthCombinations(arr, k)
  }
}

function* generateKLengthCombinations(arr: ReadonlyArray<string>, k: number): Generator<ReadonlyArray<string>> {
  function* backtrack(start: number, current: ReadonlyArray<string>): Generator<ReadonlyArray<string>> {
    if (current.length === k) {
      yield current
      return
    }

    // eslint-disable-next-line functional/no-loop-statements, functional/no-let
    for (let i = start; i < arr.length; i++) {
      yield * backtrack(i + 1, [...current, arr[i]!])
    }
  }

  yield * backtrack(0, [])
}

export const getUniqueNames = (sourceArr: ReadonlyArray<string>): ReadonlyArray<string> => [...new Set(sourceArr)]

export const isOnlyDigits = (str?: string): boolean => (str ? /^\d+$/.test(str) : false)

export function filterRecordByKeys<T extends { readonly [key: string]: unknown }>(
  record: T,
  keys: ReadonlyArray<string>
): Readonly<T> {
  const filteredEntries = Object.entries(record).filter(([key]) => keys.includes(key))

  return Object.fromEntries(filteredEntries) as T
}

export const mergeFileMapsExtraction = (
  fileMapsExtraction: ReadonlyArray<{ [key: string]: ReadonlyArray<string> }>
): { [key: string]: ReadonlyArray<string> } => {
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
    {} as { [key: string]: ReadonlyArray<string> }
  )

  return mergedFileMapsExtraction
}

export const getDuplicateStoragePath = (options: TUserChoices): AbsolutePath => {
  const rootPathToStorageFolder = (options.folderPath || options.folderPaths?.[0]) as string
  const absolutePathToStorageFolder = path.join(rootPathToStorageFolder, PREFIX_FILE_FOLDER)

  return absolutePathToStorageFolder
}

export const logExtractionStatistics = (
  fileMap: { readonly [key: string]: ReadonlyArray<string> },
  readonly: boolean
): void => {
  const formatted = convertToApplyExtractorStatistics(fileMap, { readonly })
  console.table(formatted)
}

export const logUniversalStatistics = (
  duplicateMaps: ReadonlyArray<TDuplicateFormatTorrent | TDuplicateFormatTxt>,
  options: TUserChoices
): void => {
  const formatted = convertToOutputUniversal({ readonly: options.readonly })(
    options.fileExtensions.reduce(
      (acc, ext) => ({
        ...acc,
        [ext]: duplicateMaps[options.fileExtensions.indexOf(ext)],
      }),
      {}
    )
  )
  console.table(formatted)
}
