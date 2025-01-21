import path from 'node:path'

import { pipe } from 'fp-ts/lib/function'

import type { TGetDuplicatesInFolderTorrent } from './types'

import { readDir } from '@/files'
import { getAbsPathFolders } from '@/helpers'
import { getFilesInfo, isIndirectDuplicateFilename } from '@/logic'
import type { TExtensionsRemoveDuplicatesStrategies } from '@/logic/types'

/**
 * @description
 * Describe how to extract name from .torrent file
 */
export const torrentDuplicateStrategy: TExtensionsRemoveDuplicatesStrategies['torrent'] = {
  extractor: file => file.filename,
  isConsideredDuplicate: filenames => curFile => isIndirectDuplicateFilename(filenames, curFile.filename),
}

const getDuplicateTorrentsFilesInFolder: TGetDuplicatesInFolderTorrent = strategy => async (folder) => {
  const filenames = await readDir(folder)

  const torrentFilenames = filenames.filter(filename => path.extname(filename) === '.torrent')

  const filesInfo = await getFilesInfo({
    folder,
    filenames: torrentFilenames,
  })

  const isConsideredDuplicate = strategy.isConsideredDuplicate(filesInfo.map(v => v.filename))

  const duplicateAbsolutePaths = filesInfo.reduce<Awaited<ReturnType<ReturnType<TGetDuplicatesInFolderTorrent>>>>(
    (acc, cur) => {
      const isDuplicate = isConsideredDuplicate(cur)

      return isDuplicate
        ? {
            ...acc,
            pathsForDuplicateFiles: [...acc.pathsForDuplicateFiles, cur.absolutePath],
            duplicateLength: acc.duplicateLength + 1,
          }
        : {
            ...acc,
            uniqueLength: acc.uniqueLength + 1,
          }
    },
    {
      pathsForDuplicateFiles: [],
      folder,
      uniqueLength: 0,
      duplicateLength: 0,
    }
  )

  return duplicateAbsolutePaths
}

/**
 * @description
 * Create duplicate maps for all .txt files in folders
 */
export const getDuplicateTorrentsFilesInFolders = async (
  folderList: string[],
  options: { strategy: TExtensionsRemoveDuplicatesStrategies['torrent'] }
) => {
  const folders = pipe(folderList, getAbsPathFolders)
  const duplicates = await Promise.all(folders.map(getDuplicateTorrentsFilesInFolder(options.strategy)))

  return duplicates.filter(v => v.uniqueLength > 0)
}
