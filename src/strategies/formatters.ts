import * as A from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/function'

import { convertToOutputTorrent } from './torrent/formatter'
import type { TDuplicateFormatTorrent, TDuplicateFormatTxt } from './torrent/types'
import { convertToOutputTxt } from './txt/formatter'

import { generateCombinationFolderName } from '@/logic/helpers'
import type { TUserChoices } from '@/logic/types'

export type TOutputFormatTorrentUniversal = {
  folder_or_filename: string
  amount_all_names: number
  amount_unique_names: number
  amount_duplicates_names: number
  readonlyMode: boolean
}[]

export type TConvertToOutputUniversal = (options: { readonly: boolean }) => (formats: {
  txt?: Record<
    string,
    {
      unique: string[]
      duplicates: string[]
      duplicatesLength: number
      uniqueLength: number
    }
  >[]
  torrent?: {
    pathsForDuplicateFiles: AbsolutePath[]
    uniqueLength: number
    duplicateLength: number
    folder: string
  }[]
}) => [
  ...TOutputFormatTorrentUniversal,
  {
    amount_all_names: number
    amount_duplicates_names: number
  }
]

/**
 * @example
 * {
 *  'cat.torrent': ['folder1/cat.torrent', 'folder2/animals.txt'],.
 *  'dog.torrent': ['folder1/dog.torrent', 'folder2/dog.torrent'],.
 * }
 */
export type TConvertToApplyExtractorStatistics = (options: { readonly: boolean }) => (
  input: Record<Filename, AbsolutePath[]>,
) => (
  | {
    duplicate_filename: string
    amount_duplicates: number
    common_folders_or_files: string
    readonly_mode: boolean
  }
  | { amount_duplicates: number }
)[]

export const sortByAlphabetical = <T>(arr: T[], _extractor?: (el: T) => string): T[] => {
  const extractor = (_extractor || ((el: T): T => el)) as (el: T) => string

  return arr.toSorted((a, b) => {
    const str1 = extractor(a)
    const str2 = extractor(b)

    return str1.localeCompare(str2, 'en', { sensitivity: 'base' })
  })
}

export const convertToOutputUniversal: TConvertToOutputUniversal = options => (formats) => {
  const formattedTxts = formats.txt
    ? convertToOutputTxt({ readonly: options.readonly })(formats.txt)
    : []
  const formattedTorrents = formats.torrent
    ? convertToOutputTorrent({ readonly: options.readonly })(formats.torrent)
    : []

  const formattedMap = [...formattedTxts, ...formattedTorrents].map(v => ({
    // eslint-disable-next-line ts/no-explicit-any
    folder_or_filename: ((v as any).folder || (v as any).filename) as string,
    amount_all_names: v.amount_all_names,
    amount_unique_names: v.amount_unique_names,
    amount_duplicates_names: v.amount_duplicates_names,
    readonlyMode: options.readonly,
  }))

  // calculate total amount and add to formattedMap last el
  const totalAmount = formattedMap.reduce((acc, cur) => acc + cur.amount_all_names, 0)
  const totalAmountDuplicates = formattedMap.reduce(
    (acc, cur) => acc + cur.amount_duplicates_names,
    0
  )

  return [
    ...formattedMap,
    {
      amount_all_names: totalAmount,
      amount_duplicates_names: totalAmountDuplicates,
    },
  ]
}

export const convertToApplyExtractorStatistics: TConvertToApplyExtractorStatistics
  = options => (input) => {
    const formatted = sortByAlphabetical(Object.entries(input), el => el[0]).map(
      ([filename, absolutePaths]) => {
        const foldersName = generateCombinationFolderName(
          sortByAlphabetical(absolutePaths, p =>
            p.endsWith('.torrent') ? p.split('/').at(-2)! : `${p.split('/').slice(-2).join('.')}`)
        )
          .split('_')
          .map(folderName =>
            folderName.includes('--') ? `${folderName.replaceAll('--', '/')}.txt` : folderName
          )
          .join(', ')

        return {
          duplicate_filename: filename,
          amount_duplicates: absolutePaths.length,
          common_folders_or_files: foldersName,
          readonly_mode: options.readonly,
        }
      }
    )

    return [
      ...formatted,
      {
        amount_duplicates: formatted.reduce((acc, cur) => acc + cur.amount_duplicates, 0),
      },
    ]
  }

export const logExtractionStatistics
  = (readonly: boolean) =>
    (fileMap: Record<string, string[]>): void =>
      pipe(fileMap, convertToApplyExtractorStatistics({ readonly }), console.table)

export const logUniversalStatistics = (
  duplicateMaps: (TDuplicateFormatTorrent | TDuplicateFormatTxt)[],
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
