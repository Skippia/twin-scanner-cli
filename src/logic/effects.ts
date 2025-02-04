import path from 'node:path'

import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/TaskEither'

import {
  areAllTextFiles,
  generateCombinationFolderName,
  getDuplicateStoragePath,
  logExtractionStatistics,
  logUniversalStatistics,
  mergeFileMapsExtraction,
} from './helpers'
import type { ExtractorFileExtensions } from './types'

import type { TUserChoices } from '@/cli'
import { appendIntoTxtFileEffect, createFolderEffect, removeEmptyFoldersInFolderEffect } from '@/files/effects'
import type { TExtensionsRemoveDuplicatesStrategies } from '@/strategies'
import { torrentDuplicateStrategy } from '@/strategies/torrent'
import type { TDuplicateFormatTorrent, TDuplicateFormatTxt } from '@/strategies/torrent/types'
import { txtDuplicateStrategy } from '@/strategies/txt'
import { convertTorrentFilenameToURL } from '@/strategies/txt/helpers'
import type { TApplyFileExtractionEffect } from '@/strategies/txt/types'

const processFileTypeHandlers = (
  strategies: TExtensionsRemoveDuplicatesStrategies,
  absolutePathToCommonStorageCur: string,
  duplicateFilename: string
): Readonly<Record<ExtractorFileExtensions, (dAbsPath: AbsolutePath) => TE.TaskEither<Error, void>>> => ({
  torrent: (dAbsPath: AbsolutePath): TE.TaskEither<Error, void> =>
    strategies.torrent.moveFileEffect(dAbsPath, path.join(absolutePathToCommonStorageCur, duplicateFilename)),
  txt: (duplicateAbsolutePath: AbsolutePath): TE.TaskEither<Error, void> =>
    strategies.txt.removeContentFromFileEffect(duplicateAbsolutePath, convertTorrentFilenameToURL(duplicateFilename)),
})

const handleMixedFilesEffect = (
  strategies: TExtensionsRemoveDuplicatesStrategies,
  absolutePathToCommonStorageCur: string,
  duplicateFilename: string,
  paths: Array<string>
): TE.TaskEither<Error, void[]> =>
  pipe(
    paths,
    A.traverse(TE.ApplicativePar)(dAbsPath =>
      // 2a. If torrent => move to file to duplicate folder
      // 2b. Since there is a real file => just remove from source txt file
      dAbsPath.endsWith('.torrent')
        ? processFileTypeHandlers(strategies, absolutePathToCommonStorageCur, duplicateFilename).torrent(dAbsPath)
        : processFileTypeHandlers(strategies, absolutePathToCommonStorageCur, duplicateFilename).txt(dAbsPath)
    )
  )

const handleTextFilesEffect = (
  strategies: TExtensionsRemoveDuplicatesStrategies,
  absolutePathToCommonStorageCur: string,
  duplicateFilename: string,
  paths: Array<string>
): TE.TaskEither<Error, void[]> =>
  pipe(
    appendIntoTxtFileEffect(
      path.join(absolutePathToCommonStorageCur, 'common.txt'),
      convertTorrentFilenameToURL(duplicateFilename).concat('\n')
    ),
    TE.flatMap(() =>
      pipe(
        paths,
        A.traverse(TE.ApplicativePar)(duplicatePath =>
          strategies.txt.removeContentFromFileEffect(duplicatePath, convertTorrentFilenameToURL(duplicateFilename))
        )
      )
    )
  )

const processDuplicateEffect = (
  strategies: TExtensionsRemoveDuplicatesStrategies,
  storagePath: AbsolutePath,
  dFilename: string,
  dAbsPaths: Array<string>
): TE.TaskEither<Error, void[]> =>
  pipe(
    storagePath,
    createFolderEffect,
    TE.flatMap(() =>
      areAllTextFiles(dAbsPaths)
        ? handleTextFilesEffect(strategies, storagePath, dFilename, dAbsPaths)
        : handleMixedFilesEffect(strategies, storagePath, dFilename, dAbsPaths)
    )
  )

const processDuplicatesEffect
  = (
    mergedFileMapsExtraction: Readonly<Record<string, Array<string>>>,
    strategies: TExtensionsRemoveDuplicatesStrategies
  ) =>
    (absolutePathToStorageFolder: string): TE.TaskEither<Error, void[][]> =>
      pipe(
        Object.entries(mergedFileMapsExtraction),
        A.traverse(TE.ApplicativeSeq)(([duplicateFilename, duplicateAbsolutePaths]) => {
          const storageFolderName = generateCombinationFolderName(duplicateAbsolutePaths)
          const absolutePathToCommonStorageCur = path.join(absolutePathToStorageFolder, storageFolderName)

          return processDuplicateEffect(
            strategies,
            absolutePathToCommonStorageCur,
            duplicateFilename,
            duplicateAbsolutePaths
          )
        })
      )

export const applyFilesExtractionEffect: TApplyFileExtractionEffect = (strategies, options) => fileMapsExtraction =>
  pipe(fileMapsExtraction, mergeFileMapsExtraction, mergedFileMapsExtraction =>
    pipe(mergedFileMapsExtraction, logExtractionStatistics(options.readonly), () =>
      options.readonly
        ? TE.right(undefined)
        : pipe(options, getDuplicateStoragePath, absolutePathToStorageFolder =>
            pipe(
              absolutePathToStorageFolder,
              processDuplicatesEffect(mergedFileMapsExtraction, strategies),
              TE.map(() => removeEmptyFoldersInFolderEffect(absolutePathToStorageFolder)),
              TE.map(() => console.log('Duplicates were extracted to', absolutePathToStorageFolder))
            ))))

export const getRidOfDuplicatesInFoldersEffect = (
  folderList: string[],
  strategies: TExtensionsRemoveDuplicatesStrategies,
  options: TUserChoices
): TE.TaskEither<Error, void> =>
  pipe(
    options.fileExtensions as ('txt' | 'torrent')[],
    A.traverse(TE.ApplicativePar)(
      ext =>
        strategies[ext].getDuplicateMap(folderList) as TE.TaskEither<
          Error,
          TDuplicateFormatTxt | TDuplicateFormatTorrent
        >
    ),
    TE.flatMap((duplicateMaps) => {
      const torrentIdx = options.fileExtensions.findIndex(ext => ext === 'torrent')
      const txtIdx = options.fileExtensions.findIndex(ext => ext === 'txt')

      const txtFilesMapDuplicates = duplicateMaps[txtIdx]
      const torrentFileDuplicates = duplicateMaps[torrentIdx]

      return pipe(
        [
          txtFilesMapDuplicates
            ? txtDuplicateStrategy.removeDuplicatesEffect(
                txtFilesMapDuplicates as TDuplicateFormatTxt,
                options.readonly
              )
            : TE.right(undefined),
          torrentFileDuplicates
            ? torrentDuplicateStrategy.removeDuplicatesEffect(
                torrentFileDuplicates as TDuplicateFormatTorrent,
                options.readonly
              )
            : TE.right(undefined),
        ] as TE.TaskEither<Error, void | void[] | undefined>[],
        A.sequence(TE.ApplicativePar),
        TE.flatMap(() => TE.fromIO(() => logUniversalStatistics(duplicateMaps, options)))
      )
    })
  )
