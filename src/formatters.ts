import path from "path"
import type { TGetDuplicatesInFoldersTxt, TGetDuplicatesInFolderTorrent } from "./types"

export type TOutputFormatTxt = {
  filename: string
  amount_all_names: number
  amount_unique_names: number
  amount_duplicates_names: number
  readonlyMode: boolean
}[]

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

export type TConvertToOutputTxt = (options: {
  readonly: boolean
}) => (raw: Awaited<ReturnType<TGetDuplicatesInFoldersTxt>>) => TOutputFormatTxt

export type TConvertToOutputTorrent = (options: {
  readonly: boolean
}) => (raw: Awaited<ReturnType<ReturnType<TGetDuplicatesInFolderTorrent>>>[]) => TOutputFormatTorrent

export type TConvertToOutputUniversal = (options: {
  readonly: boolean
}) => (formats: {
  txt: Parameters<ReturnType<TConvertToOutputTxt>>[0]
  torrent: Parameters<ReturnType<TConvertToOutputTorrent>>[0]
}) => TOutputFormatTorrentUniversal


export const convertToOutputTxt: TConvertToOutputTxt = (options) => (raw) =>
  raw.flatMap((val) =>
    Object.entries(val).map(([absolutePath, ctx]) => ({
      filename: path.basename(absolutePath),
      amount_all_names: ctx.duplicatesLength + ctx.uniqueLength,
      amount_unique_names: ctx.uniqueLength,
      amount_duplicates_names: ctx.duplicatesLength,
      readonlyMode: options.readonly,
    })),
  )

export const convertToOutputTorrent: TConvertToOutputTorrent = (options) => (raws) =>
  raws.map((raw) => ({
    folder: raw.fileOrFolder,
    amount_all_names: raw.duplicateLength + raw.uniqueLength,
    amount_unique_names: raw.uniqueLength,
    amount_duplicates_names: raw.duplicateLength,
    readonlyMode: options.readonly,
  }))

export const convertToOutputUniversal: TConvertToOutputUniversal = (options) => (formats) => {
  const formattedTxts = convertToOutputTxt({ readonly: options.readonly })(formats.txt)
  const formattedTorrents = convertToOutputTorrent({ readonly: options.readonly })(formats.torrent)

  return [...formattedTxts, ...formattedTorrents]
  .map((v) => ({
    folder_or_filename: ((v as any).folder || (v as any).filename) as string,
    amount_all_names: v.amount_all_names,
    amount_unique_names: v.amount_unique_names,
    amount_duplicates_names: v.amount_duplicates_names,
    readonlyMode: options.readonly,
  }))
}
