import { torrentDuplicateStrategy } from './torrent/index'
import type { TDuplicateFormatTorrent, TDuplicateFormatTxt } from './torrent/types'
import { txtDuplicateStrategy } from './txt/index'

import type { TExtractorsUsefulInfo, TFileInfo } from '@/logic/types'
import type { UFileExtension } from '@/shared/constants'

export type TExtensionsRemoveDuplicatesStrategies = Readonly<{
  [UFileExtension.TXT]: {
    extractor: TExtractorsUsefulInfo['txt']
    getUniqueNames: (lines: readonly string[]) => readonly string[]
    getDuplicates: (lines: readonly string[], uniqueLines: readonly string[]) => readonly string[]
    removeContentFromFileEffect: (src: AbsolutePath, contentToDelete: string) => Promise<void>
    removeDuplicatesEffect: (duplicateMap: Readonly<TDuplicateFormatTxt>, readonly: boolean) => Promise<void>
    getDuplicateMap: (folderList: readonly string[]) => Promise<TDuplicateFormatTxt>
  }
  [UFileExtension.TORRENT]: {
    extractor: TExtractorsUsefulInfo['torrent']
    isDuplicate: (filenames: readonly string[]) => (curFile: Readonly<TFileInfo>) => boolean
    moveFileEffect: (src: AbsolutePath, dest: AbsolutePath) => Promise<void>
    removeDuplicatesEffect: (
      duplicateMap: Readonly<TDuplicateFormatTorrent>,
      readonly: boolean
    ) => Promise<undefined | void[]>
    getDuplicateMap: (folderList: readonly string[]) => Promise<TDuplicateFormatTorrent>
  }
}>

export const strategies: TExtensionsRemoveDuplicatesStrategies = {
  txt: txtDuplicateStrategy,
  torrent: torrentDuplicateStrategy,
}
