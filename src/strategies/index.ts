import type * as TE from 'fp-ts/TaskEither'

import { torrentDuplicateStrategy } from './torrent/index'
import type { TDuplicateFormatTorrent, TDuplicateFormatTxt } from './torrent/types'
import { txtDuplicateStrategy } from './txt/index'

import type { TExtractorsUsefulInfo, TFileInfo } from '@/logic/types'
import type { UFileExtension } from '@/shared/constants'

export type TExtensionsRemoveDuplicatesStrategies = {
  readonly [UFileExtension.TXT]: {
    readonly extractor: TExtractorsUsefulInfo['txt']
    readonly getUniqueNames: (lines: Array<string>) => Array<string>
    readonly getDuplicates: (lines: Array<string>, uniqueLines: Array<string>) => Array<string>
    readonly removeContentFromFileEffect: (src: AbsolutePath, contentToDelete: string) => TE.TaskEither<Error, void>
    readonly removeDuplicatesEffect: (
      duplicateMap: TDuplicateFormatTxt,
      readonly: boolean,
    ) => TE.TaskEither<Error, void[][]>
    readonly getDuplicateMap: (folderList: Array<string>) => TE.TaskEither<Error, TDuplicateFormatTxt>
  }
  readonly [UFileExtension.TORRENT]: {
    readonly extractor: TExtractorsUsefulInfo['torrent']
    readonly isDuplicate: (filenames: Array<string>) => (curFile: TFileInfo) => boolean
    readonly moveFileEffect: (src: AbsolutePath, dest: AbsolutePath) => TE.TaskEither<Error, void>
    readonly removeDuplicatesEffect: (
      duplicateMap: TDuplicateFormatTorrent,
      readonly: boolean,
    ) => TE.TaskEither<Error, void[]>
    readonly getDuplicateMap: (folderList: string[]) => TE.TaskEither<Error, TDuplicateFormatTorrent>
  }
}

export const strategies: TExtensionsRemoveDuplicatesStrategies = {
  txt: txtDuplicateStrategy,
  torrent: torrentDuplicateStrategy,
}
