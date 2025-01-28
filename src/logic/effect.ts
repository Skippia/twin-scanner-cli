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
    const flattenFileMapsExtraction = fileMapsExtraction.flatMap((el) => {
      const keysOfCurrentRecord = Object.keys(el)
      const flattenRecordArr = keysOfCurrentRecord.map(key => ({
        [key]: el[key]!
      }))
      return flattenRecordArr
    })

    const mergedFileMapsExtraction = flattenFileMapsExtraction.reduce((acc, cur) => {
      const currentFilename = Object.keys(cur)[0]!
      const currentAbsolutePaths = Object.values(cur)[0]!

      return {
        ...acc,
        [currentFilename]: (acc[currentFilename]?.length || 0) > currentAbsolutePaths.length
          ? acc[currentFilename]!
          : currentAbsolutePaths
      }
    }, {} as Record<string, string[]>)

    console.table(convertToApplyExtractorStatistics(mergedFileMapsExtraction, { readonly: options.readonly }))


    if (options.readonly) return

    const prefixPathFolder = 'duplicates-extracted'
    const rootPathToStorageFolder = (options.folderPath || options.folderPaths?.[0]) as string

    const absolutePathToStorageFolder = path.join(rootPathToStorageFolder, prefixPathFolder)

    for (const [duplicateFilename, duplicateAbsolutePaths] of Object.entries(mergedFileMapsExtraction)) {
      const storageFolderName = generateCombinationFolderName(...duplicateAbsolutePaths)
      const absolutePathToCommonStorageCur = path.join(absolutePathToStorageFolder, storageFolderName)

      await createFolderEffect(absolutePathToCommonStorageCur)


      const isOnlyTxts = duplicateAbsolutePaths.every(el => el.endsWith('.txt'))

      // 1. Create common.txt file, append duplicateFilename into it and remove from other txt files
      if (isOnlyTxts) {
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

      // 2. We have mix of torrent and txt files
      else {
        for (const duplicateAbsolutePath of duplicateAbsolutePaths) {
          // 2a. If torrent => move to file to duplicate folder
          if (duplicateAbsolutePath.endsWith('.torrent')) {
            await strategies.torrent.moveFileEffect(
              duplicateAbsolutePath,
              path.join(absolutePathToCommonStorageCur, duplicateFilename)
            )

            continue
          }

          // 2b. Since there is a real file => just remove from source txt file
          if (duplicateAbsolutePath.endsWith('.txt')) {
            strategies.txt.removeContentFromFileEffect(
              duplicateAbsolutePath,
              convertTorrentFilenameToURL(duplicateFilename)
            )
          }
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
