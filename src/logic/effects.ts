import path from 'node:path'

import type * as TE from 'fp-ts/TaskEither'

import {
  areAllTextFiles,
  generateCombinationFolderName,
  getDuplicateStoragePath,
  logExtractionStatistics,
  logUniversalStatistics,
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
): {
    readonly [key in ExtractorFileExtensions]: (dAbsPath: AbsolutePath) => Promise<void>
  } => ({
  torrent: (dAbsPath: AbsolutePath): Promise<void> =>
    strategies.torrent.moveFileEffect(dAbsPath, path.join(absolutePathToCommonStorageCur, duplicateFilename)),
  txt: (duplicateAbsolutePath: AbsolutePath): Promise<void> =>
    strategies.txt.removeContentFromFileEffect(duplicateAbsolutePath, convertTorrentFilenameToURL(duplicateFilename)),
})

const handleMixedFilesEffect = async (
  strategies: TExtensionsRemoveDuplicatesStrategies,
  absolutePathToCommonStorageCur: string,
  duplicateFilename: string,
  paths: ReadonlyArray<string>
): TE.TaskEither<Error, void> =>
  await Promise.all(
    paths.map(dAbsPath =>
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
  paths: ReadonlyArray<string>
): TE.TaskEither<Error, void> =>
  await appendIntoTxtFileEffect(
    path.join(absolutePathToCommonStorageCur, 'common.txt'),
    convertTorrentFilenameToURL(duplicateFilename).concat('\n')
  ).then(() =>
    Promise.all(
      paths.map(duplicatePath =>
        strategies.txt.removeContentFromFileEffect(duplicatePath, convertTorrentFilenameToURL(duplicateFilename))
      )
    )
  )

const processDuplicateEffect = (
  strategies: TExtensionsRemoveDuplicatesStrategies,
  storagePath: AbsolutePath,
  dFilename: string,
  dAbsPaths: ReadonlyArray<string>
): TE.TaskEither<Error, void> =>
  createFolderEffect(storagePath).then(() =>
    areAllTextFiles(dAbsPaths)
      ? handleTextFilesEffect(strategies, storagePath, dFilename, dAbsPaths)
      : handleMixedFilesEffect(strategies, storagePath, dFilename, dAbsPaths)
  )

const processDuplicatesEffect = async (
  mergedFileMapsExtraction: { readonly [key: string]: ReadonlyArray<string> },
  strategies: TExtensionsRemoveDuplicatesStrategies,
  absolutePathToStorageFolder: string
): TE.TaskEither<Error, void>=> {
  // eslint-disable-next-line functional/no-loop-statements
  for (const [duplicateFilename, duplicateAbsolutePaths] of Object.entries(mergedFileMapsExtraction)) {
    const storageFolderName = generateCombinationFolderName(duplicateAbsolutePaths)
    const absolutePathToCommonStorageCur = path.join(absolutePathToStorageFolder, storageFolderName)

    // eslint-disable-next-line functional/no-expression-statements
    await processDuplicateEffect(strategies, absolutePathToCommonStorageCur, duplicateFilename, duplicateAbsolutePaths)
  }
}

export const applyFilesExtractionEffect: TApplyFileExtractionEffect
  = (strategies, options) => async (fileMapsExtraction) => {
    const mergedFileMapsExtraction = mergeFileMapsExtraction(fileMapsExtraction)

    logExtractionStatistics(mergedFileMapsExtraction, options.readonly)

    if (options.readonly) return

    const absolutePathToStorageFolder = getDuplicateStoragePath(options)

    return await processDuplicatesEffect(mergedFileMapsExtraction, strategies, absolutePathToStorageFolder)
      .then(() => removeEmptyFoldersInFolderEffect(absolutePathToStorageFolder))
      .then(() => console.log('Duplicates were extracted to', absolutePathToStorageFolder))
  }

export const getRidOfDuplicatesInFoldersEffect = (
  folderList: ReadonlyArray<string>,
  strategies: TExtensionsRemoveDuplicatesStrategies,
  options: TUserChoices
): TE.TaskEither<Error, void> => {
  const duplicateMaps = await Promise.all(
    options.fileExtensions.map(ext => strategies[ext as 'txt' | 'torrent'].getDuplicateMap(folderList))
  )

  const torrentIdx = options.fileExtensions.findIndex(ext => ext === 'torrent')
  const txtIdx = options.fileExtensions.findIndex(ext => ext === 'txt')

  const txtFilesMapDuplicates = duplicateMaps[txtIdx]
  const torrentFileDuplicates = duplicateMaps[torrentIdx]

  // Remove duplicates from txt-specific and torrent-specific
  return await Promise.all([
    txtFilesMapDuplicates
      ? txtDuplicateStrategy.removeDuplicatesEffect(txtFilesMapDuplicates as TDuplicateFormatTxt, options.readonly)
      : Promise.resolve(),
    torrentFileDuplicates
      ? torrentDuplicateStrategy.removeDuplicatesEffect(
          torrentFileDuplicates as TDuplicateFormatTorrent,
          options.readonly
        )
      : Promise.resolve(),
  ]).then(() => logUniversalStatistics(duplicateMaps, options))
}
