import path from 'node:path'

import type { TExtensionsRemoveDuplicatesStrategies } from '..'

import type { TDuplicateFormatTorrent, TGetDuplicatesInFolderTorrent } from './types'

import { readDir } from '@/files/readers'
import { getFilesInfo, isIndirectDuplicateFilename } from '@/logic/helpers'
import type { TFileInfo } from '@/logic/types'

export const isDuplicateTorrent
  = (filenames: ReadonlyArray<string>) =>
    (curFile: TFileInfo): boolean =>
      isIndirectDuplicateFilename(filenames, curFile.filename)

const getDuplicateTorrentsFilesInFolder: TGetDuplicatesInFolderTorrent = strategy => async (folder) => {
  const filenames = await readDir(folder)
  const torrentFilenames = filenames.filter(filename => path.extname(filename) === '.torrent')

  const filesInfo = await getFilesInfo({
    folder,
    filenames: torrentFilenames,
  })

  const isConsideredDuplicate = strategy.isDuplicate(filesInfo.map(v => v.filename))

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
  folderList: ReadonlyArray<string>,
  options: { readonly strategy: TExtensionsRemoveDuplicatesStrategies['torrent'] }
): Promise<TDuplicateFormatTorrent> => {
  const duplicates = await Promise.all(folderList.map(getDuplicateTorrentsFilesInFolder(options.strategy)))

  return duplicates.filter(v => v.uniqueLength > 0)
}
