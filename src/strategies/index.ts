import type * as TE from 'fp-ts/lib/TaskEither'

import { torrentDuplicateStrategy } from './torrent/index'
import type { TDuplicateFormatTorrent, TDuplicateFormatTxt } from './torrent/types'
import { txtDuplicateStrategy } from './txt/index'

import type { TExtractorsUsefulInfo, TFileInfo } from '@/logic/types'
import type { UFileExtension } from '@/shared/constants'

export type TExtensionsRemoveDuplicatesStrategies = {
  [UFileExtension.TXT]: {
    extractor: TExtractorsUsefulInfo['txt']
    getUniqueNames: (lines: string[]) => string[]
    getDuplicates: (lines: string[], uniqueLines: string[]) => string[]
    removeContentFromFileEffect: (
      src: AbsolutePath,
      contentToDelete: string,
    ) => TE.TaskEither<Error, void>
    removeDuplicatesEffect: (
      duplicateMap: TDuplicateFormatTxt,
      readonly: boolean,
    ) => TE.TaskEither<Error, void[][]>
    getDuplicateMap: (folderList: string[]) => TE.TaskEither<Error, TDuplicateFormatTxt>
  }
  [UFileExtension.TORRENT]: {
    extractor: TExtractorsUsefulInfo['torrent']
    isDuplicate: (filenames: string[]) => (curFile: TFileInfo) => boolean
    moveFileEffect: (src: AbsolutePath, dest: AbsolutePath) => TE.TaskEither<Error, void>
    removeDuplicatesEffect: (
      duplicateMap: TDuplicateFormatTorrent,
      readonly: boolean,
    ) => TE.TaskEither<Error, void[]>
    getDuplicateMap: (folderList: string[]) => TE.TaskEither<Error, TDuplicateFormatTorrent>
  }
}

export const strategies: TExtensionsRemoveDuplicatesStrategies = {
  txt: txtDuplicateStrategy,
  torrent: torrentDuplicateStrategy,
}
