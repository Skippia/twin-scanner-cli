import type { TExtensionsRemoveDuplicatesStrategies } from '..'

import { removeContentFromTxtFileEffect, removeDuplicatesFromTxtFileEffect } from './effects'
import {
  extractContentFromTxtFile,
  getDuplicateMapFromTxtFilesInFolders,
  getDuplicatesFromTxtFile,
} from './helpers'

import { getUniqueNames } from '@/logic/helpers'

export const txtDuplicateStrategy: TExtensionsRemoveDuplicatesStrategies['txt'] = {
  extractor: extractContentFromTxtFile,
  getUniqueNames,
  getDuplicates: getDuplicatesFromTxtFile,
  removeContentFromFileEffect: removeContentFromTxtFileEffect,
  removeDuplicatesEffect: removeDuplicatesFromTxtFileEffect,
  getDuplicateMap: (folderList: string[]) =>
    getDuplicateMapFromTxtFilesInFolders(folderList, {
      strategy: txtDuplicateStrategy,
    }),
}
