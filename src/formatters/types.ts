import type { TGetDuplicatesInFoldersTxt, TGetDuplicatesInFolderTorrent } from '@/extractors/torrent/types'

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
