import type * as TE from 'fp-ts/TaskEither'

import type { TExtensionsRemoveDuplicatesStrategies } from '..'

import type { TExtractorsUsefulInfo } from '@/logic/types'

export type TTorrentFileInfoExtractor = TExtractorsUsefulInfo['torrent']

export type TGetDuplicatesInFolderTorrent = (strategy: TExtensionsRemoveDuplicatesStrategies['torrent']) => (
  folder: AbsolutePath,
) => TE.TaskEither<Error, {
  readonly pathsForDuplicateFiles: ReadonlyArray<AbsolutePath>
  readonly uniqueLength: number
  readonly duplicateLength: number
  readonly folder: string
}>

export type TGetDuplicatesInFoldersTxt = (folderList: ReadonlyArray<RelativePath>) => TE.TaskEither<Error, {
  readonly [key: string]: {
    readonly unique: ReadonlyArray<string>
    readonly duplicates: ReadonlyArray<string>
    readonly duplicatesLength: number
    readonly uniqueLength: number
  }
}>

export type TDuplicateFormatTorrent = ReadonlyArray<{
  readonly pathsForDuplicateFiles: ReadonlyArray<AbsolutePath>
  readonly uniqueLength: number
  readonly duplicateLength: number
  readonly folder: string
}>

export type TDuplicateFormatTxt = ReadonlyArray<{
  readonly [key: string]: {
    readonly unique: ReadonlyArray<string>
    readonly duplicates: ReadonlyArray<string>
    readonly duplicatesLength: number
    readonly uniqueLength: number
  }
}>
