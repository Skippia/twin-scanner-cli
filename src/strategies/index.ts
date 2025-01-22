import { torrentDuplicateStrategy } from './torrent/index'
import type { TDuplicateFormatTorrent, TDuplicateFormatTxt } from './torrent/types'
import { txtDuplicateStrategy } from './txt/index'

import type { TExtractorsUsefulInfo, TFileInfo } from '@/logic/types'
import type { UFileExtension } from '@/shared/constants'

export type TExtensionsRemoveDuplicatesStrategies = Readonly<{
  [UFileExtension.TXT]: {
    extractor: TExtractorsUsefulInfo['txt']
    getUniqueNames: (lines: string[]) => string[]
    getDuplicates: (lines: string[], uniqueLines: string[]) => string[]
    removeContentFromFileEffect: (src: AbsolutePath, contentToDelete: string) => Promise<void>
    removeDuplicatesEffect: (duplicateMap: TDuplicateFormatTxt, readonly: boolean) => Promise<void>
    getDuplicateMap: (folderList: string[]) => Promise<TDuplicateFormatTxt>
  }
  [UFileExtension.TORRENT]: {
    extractor: TExtractorsUsefulInfo['torrent']
    isDuplicate: (filenames: string[]) => (curFile: TFileInfo) => boolean
    moveFileEffect: (src: AbsolutePath, dest: AbsolutePath) => Promise<void>
    removeDuplicatesEffect: (duplicateMap: TDuplicateFormatTorrent, readonly: boolean) => Promise<void>
    getDuplicateMap: (folderList: string[]) => Promise<TDuplicateFormatTorrent>
  }
}>

export const strategies: TExtensionsRemoveDuplicatesStrategies = {
  txt: txtDuplicateStrategy,
  torrent: torrentDuplicateStrategy
}
