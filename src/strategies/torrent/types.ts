import type * as TE from 'fp-ts/TaskEither'

import type { TExtensionsRemoveDuplicatesStrategies } from '..'

import type { TExtractorsUsefulInfo } from '@/logic/types'

export type TTorrentFileInfoExtractor = TExtractorsUsefulInfo['torrent']

export type TGetDuplicatesInFolderTorrent = (strategy: TExtensionsRemoveDuplicatesStrategies['torrent']) => (
  folder: AbsolutePath,
) => TE.TaskEither<
  Error,
  {
    readonly pathsForDuplicateFiles: Array<AbsolutePath>
    readonly uniqueLength: number
    readonly duplicateLength: number
    readonly folder: string
  }
>

export type TGetDuplicatesInFoldersTxt = (folderList: Array<RelativePath>) => TE.TaskEither<
  Error,
  Readonly<
    Record<
      string,
      {
        readonly unique: Array<string>
        readonly duplicates: Array<string>
        readonly duplicatesLength: number
        readonly uniqueLength: number
      }
    >
  >
>

export type TDuplicateFormatTorrent = {
  readonly pathsForDuplicateFiles: AbsolutePath[]
  readonly uniqueLength: number
  readonly duplicateLength: number
  readonly folder: string
}[]

export type TDuplicateFormatTxt = Array<
  Readonly<
    Record<
      string,
      {
        readonly unique: Array<string>
        readonly duplicates: Array<string>
        readonly duplicatesLength: number
        readonly uniqueLength: number
      }
    >
  >
>
