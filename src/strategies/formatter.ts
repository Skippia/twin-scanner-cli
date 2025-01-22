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

export type TConvertToOutputUniversal = (options: {
  readonly: boolean
}) => (formats: {
  txt?: Parameters<ReturnType<TConvertToOutputTxt>>[0]
  torrent?: Parameters<ReturnType<TConvertToOutputTorrent>>[0]
}) => [...TOutputFormatTorrentUniversal, { amount_all_names: number, amount_duplicates_names: number }]

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
  >[],
  options: { readonly: boolean },
) => { foldersName: string, amountDuplicates: number, readonlyMode: boolean }[]

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

export const convertToApplyExtractorStatistics: TConvertToApplyExtractorStatistics = (input, options) =>
  input.map((el) => {
    const firstKey = Object.keys(el)[0] as keyof typeof el

    // @ts-expect-error ...
    const [path1, path2] = [el[firstKey][0]!, el[firstKey][1]!]

    const foldersName = generateCombinationFolderName(path1, path2).split('_').join(', ')

    return {
      amountDuplicates: Object.keys(el).length,
      foldersName,
      readonlyMode: options.readonly,
    }
  })
