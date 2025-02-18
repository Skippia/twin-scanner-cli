import path from 'node:path'

import * as A from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import type * as Ord from 'fp-ts/lib/Ord'
import * as R from 'fp-ts/lib/Record'
import * as S from 'fp-ts/lib/string'

import type { TMonogenousUniversalMapEl, TUserChoices } from './types'

import { PREFIX_FILE_FOLDER } from '@/shared/constants'

function* generateKLengthCombinations(arr: string[], k: number): Generator<string[]> {
  function* backtrack(start: number, current: string[]): Generator<string[]> {
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

export const generateCombinationFolderName = (paths: AbsolutePath[]): string => {
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

export const isIndirectDuplicateFilename = (allFilenames: string[], filename: string): boolean => {
  const isMaybeDuplicate = filename.includes('(')

  if (!isMaybeDuplicate) return false

  const originalFilename = extractOriginalFilename(filename)

  return allFilenames.includes(originalFilename)
}

export const areAllTextFiles = (paths: string[]): boolean =>
  paths.every(path => path.endsWith('.txt'))

export function* getCombinationsGenerator(arr: string[]): Generator<string[]> {
  const n = arr.length

  // eslint-disable-next-line functional/no-loop-statements, functional/no-let
  for (let k = n; k >= 2; k--) {
    yield * generateKLengthCombinations(arr, k)
  }
}

export const getUniqueNames = (sourceArr: string[]): string[] => pipe(sourceArr, A.uniq(S.Eq))

export const isOnlyDigits = (str?: string): boolean =>
  pipe(
    str,
    O.fromNullable,
    O.exists(s => /^\d+$/.test(s))
  )

export const filterRecordByKeys = <T extends Record<string, unknown>>(
  record: T,
  keys: string[]
): T =>
  pipe(
    record,
    R.filterWithIndex(key => keys.includes(key))
  ) as T

export const getDuplicateStoragePath = (options: TUserChoices): AbsolutePath => {
  const rootPathToStorageFolder = options.folderConfig[0] as string
  const absolutePathToStorageFolder = path.join(rootPathToStorageFolder, PREFIX_FILE_FOLDER)

  return absolutePathToStorageFolder
}

export const mergeFileMapsExtraction = (
  fileMapsExtraction: Record<string, string[]>[]
): Record<string, string[]> => {
  const flattenFileMapsExtraction = pipe(
    fileMapsExtraction,
    A.flatMap(record =>
      pipe(
        record,
        R.toEntries,
        A.map(([key, value]) => ({ [key]: value }))
      )
    )
  )

  return pipe(
    flattenFileMapsExtraction,
    A.reduce({} as Record<string, string[]>, (acc, cur) => {
      const currentFilename = Object.keys(cur)[0]!
      const currentAbsolutePaths = Object.values(cur)[0]!

      return {
        ...acc,
        [currentFilename]:
          (acc[currentFilename]?.length || 0) > currentAbsolutePaths.length
            ? acc[currentFilename]!
            : currentAbsolutePaths,
      }
    })
  )
}

export const ordUniversalMapEl: Ord.Ord<TMonogenousUniversalMapEl> = {
  equals: (a, b) => a.amount === b.amount,
  compare: (a, b) => (a.amount > b.amount ? 1 : -1),
}
