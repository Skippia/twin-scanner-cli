import path from 'node:path'

import { pipe } from 'fp-ts/lib/function'

import type { TGetDuplicatesFromTxtFilesInFolder } from './types'

import { readDir } from '@/files'
import { getAbsPathFolders, getUniqueNames } from '@/helpers'
import { getFilesInfo } from '@/logic'
import type { TExtensionsRemoveDuplicatesStrategies } from '@/logic/types'

/**
 * @description
 * Describe how to extract names from .txt file
 */
export const txtDuplicateStrategy: TExtensionsRemoveDuplicatesStrategies['txt'] = {
  extractor: file => file.content?.split('\n').filter(v => Boolean(v)) || [''],
  getUniqueNames: lines => getUniqueNames(lines),
  getDuplicates: lines =>
    lines.reduce<string[]>(
      (acc, cur, idx) => (lines.indexOf(cur, idx) !== lines.lastIndexOf(cur) ? [...acc, cur] : [...acc]),
      []
    ),
}

export const getDuplicateMapFromTxtFilesInFolder: TGetDuplicatesFromTxtFilesInFolder = strategy => async (folder) => {
  const filenames = await readDir(folder)
  const txtFilenames = filenames.filter(filename => path.extname(filename) === '.txt')

  const filesInfo = await getFilesInfo({
    folder,
    filenames: txtFilenames,
  })

  const updateTxtMapFiles = filesInfo.reduce<Awaited<ReturnType<ReturnType<TGetDuplicatesFromTxtFilesInFolder>>>>(
    (acc, cur) => {
      const extractedContent = strategy.extractor(cur)
      const uniqueNames = strategy.getUniqueNames(extractedContent)
      const duplicateNames = strategy.getDuplicates(extractedContent, uniqueNames)

      return {
        ...acc,
        [cur.absolutePath]: {
          duplicates: duplicateNames,
          unique: uniqueNames,
          duplicatesLength: duplicateNames.length,
          uniqueLength: uniqueNames.length,
        },
      }
    },
    {}
  )

  return updateTxtMapFiles
}

/**
 * @description
 * Create duplicate maps for all .txt files in folders
 */
export const getDuplicateMapFromTxtFilesInFolders = async (
  folderList: string[],
  options: { strategy: TExtensionsRemoveDuplicatesStrategies['txt'] }
) => {
  const pathFolders = pipe(folderList, getAbsPathFolders)

  return await Promise.all(pathFolders.map(getDuplicateMapFromTxtFilesInFolder(options.strategy)))
}
