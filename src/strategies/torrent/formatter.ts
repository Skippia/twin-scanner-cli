import type { TOutputFormatTorrent } from '../formatters'

export type TConvertToOutputTorrent = (options: { readonly readonly: boolean }) => (
  raw: ReadonlyArray<{
    readonly pathsForDuplicateFiles: ReadonlyArray<AbsolutePath>
    readonly uniqueLength: number
    readonly duplicateLength: number
    readonly folder: string
  }>,
) => TOutputFormatTorrent

export const convertToOutputTorrent: TConvertToOutputTorrent = options => raws =>
  raws.map(raw => ({
    folder: raw.folder,
    amount_all_names: raw.duplicateLength + raw.uniqueLength,
    amount_unique_names: raw.uniqueLength,
    amount_duplicates_names: raw.duplicateLength,
    readonlyMode: options.readonly,
  }))
