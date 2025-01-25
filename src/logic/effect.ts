import path from 'node:path'

import { generateCombinationFolderName } from './helpers'

import type { TUserChoices } from '@/cli'
import { appendIntoTxtFileEffect, createFolderEffect, removeEmptyFoldersInFolderEffect } from '@/files/effect'
import type { TExtensionsRemoveDuplicatesStrategies } from '@/strategies'
import { convertToApplyExtractorStatistics, convertToOutputUniversal } from '@/strategies/formatter'
import { torrentDuplicateStrategy } from '@/strategies/torrent'
import type { TDuplicateFormatTorrent, TDuplicateFormatTxt } from '@/strategies/torrent/types'
import { txtDuplicateStrategy } from '@/strategies/txt'
import { convertTorrentFilenameToURL } from '@/strategies/txt/helpers'
import type { TApplyFileExtractionEffect } from '@/strategies/txt/types'

export const applyFilesExtractionEffect: TApplyFileExtractionEffect
  = (strategies, options) => async (fileMapsExtraction) => {
    console.table(convertToApplyExtractorStatistics(fileMapsExtraction, { readonly: options.readonly }))

    if (options.readonly) return

    const prefixPathFolder = 'duplicates-extracted'
    const rootPathToStorageFolder = (options.folderPath || options.folderPaths?.[0]) as string

    const absolutePathToStorageFolder = path.join(rootPathToStorageFolder, prefixPathFolder)

    for (const fileMapExtraction of fileMapsExtraction) {
      for (const [duplicateFilename, duplicateAbsolutePaths] of Object.entries(fileMapExtraction)) {
        const storageFolderName = generateCombinationFolderName(duplicateAbsolutePaths[0]!, duplicateAbsolutePaths[1]!)

        const absolutePathToCommonStorageCur = path.join(absolutePathToStorageFolder, storageFolderName)

        await createFolderEffect(absolutePathToCommonStorageCur)

        const bothTorrents = duplicateAbsolutePaths.every(el => el.endsWith('.torrent'))
        const bothTxts = duplicateAbsolutePaths.every(el => el.endsWith('.txt'))
        const isSomeTorrent = duplicateAbsolutePaths.some(el => el.endsWith('.torrent'))
        const isSomeTxt = duplicateAbsolutePaths.some(el => el.endsWith('.txt'))

        // 1. If both torrents => move to storageFolder folder
        if (bothTorrents) {
          await Promise.all(
            duplicateAbsolutePaths.map(duplicateAbsolutePath =>
              strategies.torrent.moveFileEffect(
                duplicateAbsolutePath,
                path.join(absolutePathToCommonStorageCur, duplicateFilename)
              )
            )
          )
        }

        /**
         * 2. If both txt => create new txt file in storageFolder folder, fill with duplicate
         * and remove duplicate from both txt files
         */
        if (bothTxts) {
          await appendIntoTxtFileEffect(
            path.join(absolutePathToCommonStorageCur, 'common.txt'),
            convertTorrentFilenameToURL(duplicateFilename).concat('\n')
          )

          await Promise.all(
            duplicateAbsolutePaths.map(duplicateAbsolutePath =>
              strategies.txt.removeContentFromFileEffect(
                duplicateAbsolutePath,
                convertTorrentFilenameToURL(duplicateFilename)
              )
            )
          )
        }

        /**
         * 3. If one torrent, one txt => move to storageFolder and remove duplicate from txt
         */
        if (isSomeTorrent && isSomeTxt) {
          const torrentPath = duplicateAbsolutePaths.find(el => el.endsWith('.torrent'))!
          const txtPath = duplicateAbsolutePaths.find(el => el.endsWith('.txt'))!

          await Promise.all([
            strategies.torrent.moveFileEffect(
              torrentPath,
              path.join(absolutePathToCommonStorageCur, duplicateFilename)
            ),
            strategies.txt.removeContentFromFileEffect(txtPath, convertTorrentFilenameToURL(duplicateFilename)),
          ])
        }
      }
    }

    await removeEmptyFoldersInFolderEffect(absolutePathToStorageFolder)

    console.log('Duplicates were extracted to', absolutePathToStorageFolder)
  }

export const getRidOfDuplicatesInFoldersEffect = async (
  folderList: string[],
  strategies: TExtensionsRemoveDuplicatesStrategies,
  options: TUserChoices
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
    await txtDuplicateStrategy.removeDuplicatesEffect(txtFilesMapDuplicates as TDuplicateFormatTxt, options.readonly)

  if (torrentFileDuplicates) {
    await torrentDuplicateStrategy.removeDuplicatesEffect(
      torrentFileDuplicates as TDuplicateFormatTorrent,
      options.readonly
    )
  }

  const formatted = convertToOutputUniversal({ readonly: options.readonly })(
    options.fileExtensions.reduce(
      (acc, ext) => ({
        ...acc,
        [ext]: duplicateMaps[options.fileExtensions.indexOf(ext)],
      }),
      {} as { txt: TDuplicateFormatTxt, torrent: TDuplicateFormatTorrent }
    )
  )

  console.table(formatted)
}
