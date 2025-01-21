import type { TConvertToOutputTorrent, TConvertToOutputTxt, TConvertToOutputUniversal } from './types'

export const convertToOutputTxt: TConvertToOutputTxt = options => raw =>
  raw.flatMap(val =>
    Object.entries(val).map(([absolutePath, ctx]) => ({
      filename: absolutePath,
      amount_all_names: ctx.duplicatesLength + ctx.uniqueLength,
      amount_unique_names: ctx.uniqueLength,
      amount_duplicates_names: ctx.duplicatesLength,
      readonlyMode: options.readonly,
    }))
  )

export const convertToOutputTorrent: TConvertToOutputTorrent = options => raws =>
  raws.map(raw => ({
    folder: raw.folder,
    amount_all_names: raw.duplicateLength + raw.uniqueLength,
    amount_unique_names: raw.uniqueLength,
    amount_duplicates_names: raw.duplicateLength,
    readonlyMode: options.readonly,
  }))

export const convertToOutputUniversal: TConvertToOutputUniversal = options => (formats) => {
  const formattedTxts = convertToOutputTxt({ readonly: options.readonly })(formats.txt)
  const formattedTorrents = convertToOutputTorrent({ readonly: options.readonly })(formats.torrent)

  return [...formattedTxts, ...formattedTorrents].map(v => ({
    // eslint-disable-next-line ts/no-explicit-any
    folder_or_filename: ((v as any).folder || (v as any).filename) as string,
    amount_all_names: v.amount_all_names,
    amount_unique_names: v.amount_unique_names,
    amount_duplicates_names: v.amount_duplicates_names,
    readonlyMode: options.readonly,
  }))
}
