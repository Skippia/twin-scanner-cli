import type { TExtensionsRemoveDuplicatesStrategies } from '..'

import type { TExtractorsUsefulInfo } from '@/logic/types'

export type TTorrentFileInfoExtractor = TExtractorsUsefulInfo['torrent']

export type TGetDuplicatesInFolderTorrent = (strategy: TExtensionsRemoveDuplicatesStrategies['torrent']) => (
  folder: AbsolutePath,
) => Promise<{
  pathsForDuplicateFiles: AbsolutePath[]
  uniqueLength: number
  duplicateLength: number
  folder: string
}>

export type TGetDuplicatesInFoldersTxt = (folderList: RelativePath[]) => Promise<
  Record<
    string,
    {
      unique: string[]
      duplicates: string[]
      duplicatesLength: number
      uniqueLength: number
    }
  >[]
>

export type TDuplicateFormatTorrent = {
  pathsForDuplicateFiles: AbsolutePath[]
  uniqueLength: number
  duplicateLength: number
  folder: string
}[]

export type TDuplicateFormatTxt = Record<
  string,
  {
    unique: string[]
    duplicates: string[]
    duplicatesLength: number
    uniqueLength: number
  }
>[]
