import path from 'node:path'

import * as A from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'

import type { TExtensionsRemoveDuplicatesStrategies } from '..'

import type { TDuplicateFormatTorrent, TGetDuplicatesInFolderTorrent } from './types'

import { readDirTE } from '@/files/system-operations'
import { isIndirectDuplicateFilename } from '@/logic/helpers'
import { getFilesInfo } from '@/logic/readers'
import type { TFileInfo } from '@/logic/types'

type X = {
  pathsForDuplicateFiles: string[]
  folder: string
  uniqueLength: number
  duplicateLength: number
}

const getDuplicateAbsolutePaths
  = (folder: string, filesInfo: TFileInfo[]) =>
    (isConsideredDuplicate: (curFile: TFileInfo) => boolean): X =>
      filesInfo.reduce(
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
        pathsForDuplicateFiles: [] as string[],
        folder,
        uniqueLength: 0,
        duplicateLength: 0,
      } satisfies X
      )

export const isDuplicateTorrent
  = (filenames: string[]) =>
    (curFile: TFileInfo): boolean =>
      isIndirectDuplicateFilename(filenames, curFile.filename)

const getDuplicateTorrentsFilesInFolder: TGetDuplicatesInFolderTorrent = strategy => folder =>
  pipe(
    folder,
    readDirTE,
    TE.flatMap(filenames =>
      pipe(
        filenames,
        A.filter(filename => path.extname(filename) === '.torrent'),
        getFilesInfo(folder),
        TE.map(filesInfo =>
          pipe(
            filesInfo,
            A.map(v => v.filename),
            strategy.isDuplicate,
            getDuplicateAbsolutePaths(folder, filesInfo)
          )
        )
      )
    )
  )

/**
 * @description
 * Create duplicate maps for all .txt files in folders
 */
export const getDuplicateTorrentsFilesInFolders = (
  folderList: string[],
  options: {
    readonly strategy: TExtensionsRemoveDuplicatesStrategies['torrent']
  }
): TE.TaskEither<Error, TDuplicateFormatTorrent> =>
  pipe(
    folderList,
    A.traverse(TE.ApplicativePar)(getDuplicateTorrentsFilesInFolder(options.strategy)),
    TE.map(duplicates =>
      pipe(
        duplicates,
        A.filter(v => v.uniqueLength > 0)
      )
    )
  )
