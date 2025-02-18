import type { TExtensionsRemoveDuplicatesStrategies } from '../types'

import { removeDuplicatesTorrentEffect } from './effects'
import { getDuplicateTorrentsFilesInFolders, isDuplicateTorrent } from './helpers'

import { moveFileEffect } from '@/files/effects'

export const torrentDuplicateStrategy: TExtensionsRemoveDuplicatesStrategies['torrent'] = {
  extractor: file => file.filename,
  isDuplicate: isDuplicateTorrent,
  moveFileEffect,
  removeDuplicatesEffect: removeDuplicatesTorrentEffect,
  getDuplicateMap: (folderList: string[]) =>
    getDuplicateTorrentsFilesInFolders(folderList, {
      strategy: torrentDuplicateStrategy,
    }),
}
