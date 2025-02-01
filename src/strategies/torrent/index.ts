import type { TExtensionsRemoveDuplicatesStrategies } from '..'

import { removeDuplicatesTorrentEffect } from './effect'
import { getDuplicateTorrentsFilesInFolders, isDuplicateTorrent } from './helpers'

import { moveFileEffect } from '@/files/effect'

export const torrentDuplicateStrategy: TExtensionsRemoveDuplicatesStrategies['torrent'] = {
  extractor: file => file.filename,
  isDuplicate: isDuplicateTorrent,
  moveFileEffect,
  removeDuplicatesEffect: removeDuplicatesTorrentEffect,
  getDuplicateMap: (folderList: ReadonlyArray<string>) =>
    getDuplicateTorrentsFilesInFolders(folderList, {
      strategy: torrentDuplicateStrategy,
    }),
}
