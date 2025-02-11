import type * as TE from 'fp-ts/lib/TaskEither'

import type { TExtensionsRemoveDuplicatesStrategies } from '..'

import type { TExtractorsUsefulInfo } from '@/logic/types'

export type TTorrentFileInfoExtractor = TExtractorsUsefulInfo['torrent']

export type TGetDuplicatesInFolderTorrent = (
  strategy: TExtensionsRemoveDuplicatesStrategies['torrent'],
) => (folder: AbsolutePath) => TE.TaskEither<
  Error,
  {
    pathsForDuplicateFiles: AbsolutePath[]
    uniqueLength: number
    duplicateLength: number
    folder: string
  }
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
