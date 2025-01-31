/* eslint-disable functional/no-return-void */
import path from 'node:path'

import { areAllTextFiles, generateCombinationFolderName, getDuplicateStoragePath, logExtractionStatistics, logUniversalStatistics, mergeFileMapsExtraction } from './helpers'

import type { TUserChoices } from '@/cli'
import { appendIntoTxtFileEffect, createFolderEffect, removeEmptyFoldersInFolderEffect } from '@/files/effect'
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
) => ({
  '.torrent': (duplicateAbsolutePath: AbsolutePath) => strategies.torrent.moveFileEffect(
    duplicateAbsolutePath,
    path.join(absolutePathToCommonStorageCur, duplicateFilename)
  ),
  '.txt': (duplicateAbsolutePath: AbsolutePath) => strategies.txt.removeContentFromFileEffect(
    duplicateAbsolutePath,
    convertTorrentFilenameToURL(duplicateFilename)
  )
})

const handleMixedFilesEffect = async (
  strategies: TExtensionsRemoveDuplicatesStrategies,
  absolutePathToCommonStorageCur: string,
  duplicateFilename: string,
  paths: readonly string[]
) => await Promise.all(paths.map(dAbsPath =>
  dAbsPath.endsWith('.torrent')
    // 2a. If torrent => move to file to duplicate folder
    ? processFileTypeHandlers(strategies, absolutePathToCommonStorageCur, duplicateFilename)['.torrent'](dAbsPath)
    // 2b. Since there is a real file => just remove from source txt file
    : processFileTypeHandlers(strategies, absolutePathToCommonStorageCur, duplicateFilename)['.txt'](dAbsPath))
)

const handleTextFilesEffect = async (
  strategies: TExtensionsRemoveDuplicatesStrategies,
  absolutePathToCommonStorageCur: string,
  duplicateFilename: string,
  paths: readonly string[]
) =>
  await appendIntoTxtFileEffect(
    path.join(absolutePathToCommonStorageCur, 'common.txt'),
    convertTorrentFilenameToURL(duplicateFilename).concat('\n')
  )
    .then(() => Promise.all(
      paths.map(duplicatePath =>
        strategies.txt.removeContentFromFileEffect(
          duplicatePath,
          convertTorrentFilenameToURL(duplicateFilename)
        )
      )
    ))

const processDuplicateEffect = (
  strategies: TExtensionsRemoveDuplicatesStrategies,
  storagePath: AbsolutePath,
  dFilename: string,
  dAbsPaths: readonly string[]
) =>
  createFolderEffect(storagePath)
    .then(() => areAllTextFiles(dAbsPaths)
      ? handleTextFilesEffect(strategies, storagePath, dFilename, dAbsPaths)
      : handleMixedFilesEffect(strategies, storagePath, dFilename, dAbsPaths)
    )

const processDuplicatesEffect = async (
  mergedFileMapsExtraction: Readonly<Record<string, string[]>>,
  strategies: TExtensionsRemoveDuplicatesStrategies,
  absolutePathToStorageFolder: string
) => {
  // eslint-disable-next-line functional/no-loop-statements
  for (const [duplicateFilename, duplicateAbsolutePaths] of Object.entries(mergedFileMapsExtraction)) {
    const storageFolderName = generateCombinationFolderName(duplicateAbsolutePaths)
    const absolutePathToCommonStorageCur = path.join(absolutePathToStorageFolder, storageFolderName)

    // eslint-disable-next-line functional/no-expression-statements
    await processDuplicateEffect(
      strategies,
      absolutePathToCommonStorageCur,
      duplicateFilename,
      duplicateAbsolutePaths
    )
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

export const getRidOfDuplicatesInFoldersEffect = async (
  folderList: readonly string[],
  strategies: TExtensionsRemoveDuplicatesStrategies,
  options: Readonly<TUserChoices>
): Promise<void> => {
  const duplicateMaps = await Promise.all(
    options.fileExtensions.map(ext => strategies[ext as 'txt' | 'torrent'].getDuplicateMap(folderList))
  )

  const torrentIdx = options.fileExtensions.findIndex(ext => ext === 'torrent')
  const txtIdx = options.fileExtensions.findIndex(ext => ext === 'txt')

  const txtFilesMapDuplicates = duplicateMaps[txtIdx]
  const torrentFileDuplicates = duplicateMaps[torrentIdx]

  // Remove duplicates from txt-specific and torrent-specific

  if (txtFilesMapDuplicates)
    // eslint-disable-next-line functional/no-conditional-statements, functional/no-expression-statements
    await txtDuplicateStrategy.removeDuplicatesEffect(txtFilesMapDuplicates as TDuplicateFormatTxt, options.readonly)

  // eslint-disable-next-line functional/no-conditional-statements
  if (torrentFileDuplicates) {
    // eslint-disable-next-line functional/no-expression-statements
    await torrentDuplicateStrategy.removeDuplicatesEffect(
      torrentFileDuplicates as TDuplicateFormatTorrent,
      options.readonly
    )
  }

  logUniversalStatistics(duplicateMaps, options)
}
