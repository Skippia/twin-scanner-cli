import type { TOutputFormatTorrent } from '../formatter'

import type { TGetDuplicatesInFolderTorrent } from './types'

export type TConvertToOutputTorrent = (options: Readonly<{
  readonly: boolean
}>) => (raw: readonly Awaited<ReturnType<ReturnType<TGetDuplicatesInFolderTorrent>>>[]) => TOutputFormatTorrent

export const convertToOutputTorrent: TConvertToOutputTorrent = options => raws =>
  raws.map(raw => ({
    folder: raw.folder,
    amount_all_names: raw.duplicateLength + raw.uniqueLength,
    amount_unique_names: raw.uniqueLength,
    amount_duplicates_names: raw.duplicateLength,
    readonlyMode: options.readonly,
  }))
