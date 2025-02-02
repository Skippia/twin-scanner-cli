import path from 'node:path'

import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as R from 'fp-ts/Record'
import * as S from 'fp-ts/string'

import type { TUserChoices } from '@/cli'
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

  return allFilenames.includes(originalFilename)
}

export const areAllTextFiles = (paths: ReadonlyArray<string>): boolean => paths.every(path => path.endsWith('.txt'))

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

export const getUniqueNames = (sourceArr: string[]): ReadonlyArray<string> => pipe(sourceArr, A.uniq(S.Eq))

export const isOnlyDigits = (str?: string): boolean =>
  pipe(
    str,
    O.fromNullable,
    O.exists(s => /^\d+$/.test(s))
  )

export const filterRecordByKeys = <T extends { readonly [key: string]: unknown }>(
  record: T,
  keys: ReadonlyArray<string>
): Readonly<T> =>
  pipe(
    record,
    R.filterWithIndex(key => keys.includes(key))
  ) as T

export const getDuplicateStoragePath = (options: TUserChoices): AbsolutePath => {
  const rootPathToStorageFolder = (options.folderPath || options.folderPaths?.[0]) as string
  const absolutePathToStorageFolder = path.join(rootPathToStorageFolder, PREFIX_FILE_FOLDER)

  return absolutePathToStorageFolder
}

export const logExtractionStatistics = (
  fileMap: { readonly [key: string]: ReadonlyArray<string> },
  readonly: boolean
): void => pipe(fileMap, convertToApplyExtractorStatistics({ readonly }), console.table)

export const logUniversalStatistics = (
  duplicateMaps: ReadonlyArray<TDuplicateFormatTorrent | TDuplicateFormatTxt>,
  options: TUserChoices
): void =>
  pipe(
    options.fileExtensions,
    A.reduce({}, (acc, ext) => ({
      ...acc,
      [ext]: duplicateMaps[options.fileExtensions.indexOf(ext)],
    })),
    convertToOutputUniversal({ readonly: options.readonly }),
    console.table
  )
