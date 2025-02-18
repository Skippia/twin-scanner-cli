export type TOutputFormatTorrent = {
  folder: string
  amount_all_names: number
  amount_unique_names: number
  amount_duplicates_names: number
  readonlyMode: boolean
}[]

export type TConvertToOutputTorrent = (options: { readonly: boolean }) => (
  raw: {
    pathsForDuplicateFiles: AbsolutePath[]
    uniqueLength: number
    duplicateLength: number
    folder: string
  }[],
) => TOutputFormatTorrent

export const convertToOutputTorrent: TConvertToOutputTorrent = options => raws =>
  raws.map(raw => ({
    folder: raw.folder,
    amount_all_names: raw.duplicateLength + raw.uniqueLength,
    amount_unique_names: raw.uniqueLength,
    amount_duplicates_names: raw.duplicateLength,
    readonlyMode: options.readonly,
  }))
