import { convertToOutputTorrent } from './torrent/formatter'
import type { TConvertToOutputTorrent } from './torrent/formatter'
import { convertToOutputTxt } from './txt/formatter'
import type { TConvertToOutputTxt } from './txt/formatter'

import { generateCombinationFolderName } from '@/logic/helpers'

export type TOutputFormatTorrent = {
  folder: string
  amount_all_names: number
  amount_unique_names: number
  amount_duplicates_names: number
  readonlyMode: boolean
}[]

export type TOutputFormatTorrentUniversal = {
  folder_or_filename: string
  amount_all_names: number
  amount_unique_names: number
  amount_duplicates_names: number
  readonlyMode: boolean
}[]

export type TConvertToOutputUniversal = (options: Readonly<{
  readonly: boolean
}>) => (formats: Readonly<{
  txt?: Parameters<ReturnType<TConvertToOutputTxt>>[0]
  torrent?: Parameters<ReturnType<TConvertToOutputTorrent>>[0]
}>) => [...TOutputFormatTorrentUniversal, { amount_all_names: number, amount_duplicates_names: number }]

export type TConvertToApplyExtractorStatistics = (
  input: Record<
    Filename,
    AbsolutePath[]
  /**
   * @example
   * {
   *  'cat.torrent': ['folder1/cat.torrent', 'folder2/animals.txt'],.
   *  'dog.torrent': ['folder1/dog.torrent', 'folder2/dog.torrent'],.
   * }
   */
  >,
  options: Readonly<{ readonly: boolean }>,
) => {
  duplicate_filename: string
  amount_duplicates: number
  common_folders_or_files: string
  readonly_mode: boolean
}[]

export const sortByAlphabetical = <T>(arr: readonly T[], _extractor?: (el: T) => string): T[] => {
  const extractor = (_extractor || ((el: T): T => el)) as (el: T) => string

  return [...arr].sort((a, b) => {
    const str1 = extractor(a)
    const str2 = extractor(b)

    return str1.localeCompare(str2, 'en', { sensitivity: 'base' })
  })
}

export const convertToOutputUniversal: TConvertToOutputUniversal = options => (formats) => {
  const formattedTxts = formats.txt ? convertToOutputTxt({ readonly: options.readonly })(formats.txt) : []
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
  const totalAmountDuplicates = formattedMap.reduce((acc, cur) => acc + cur.amount_duplicates_names, 0)

  return [...formattedMap, { amount_all_names: totalAmount, amount_duplicates_names: totalAmountDuplicates }]
}

export const convertToApplyExtractorStatistics: TConvertToApplyExtractorStatistics = (input, options) => {
  const formatted = sortByAlphabetical(Object.entries(input), el => el[0]).map(([filename, absolutePaths]) => {
    const foldersName = generateCombinationFolderName(
      sortByAlphabetical(absolutePaths, p =>
        p.endsWith('.torrent') ? p.split('/').at(-2)! : `${p.split('/').slice(-2).join('.')}`)
    )
      .split('_')
      .map(folderName => (folderName.includes('--') ? `${folderName.replaceAll('--', '/')}.txt` : folderName))
      .join(', ')

    return {
      duplicate_filename: filename,
      amount_duplicates: absolutePaths.length,
      common_folders_or_files: foldersName,
      readonly_mode: options.readonly,
    }
  })

  return [
    ...formatted,
    {
      amount_duplicates: formatted.reduce((acc, cur) => acc + cur.amount_duplicates, 0),
    },
  ] as ReturnType<TConvertToApplyExtractorStatistics>
}
