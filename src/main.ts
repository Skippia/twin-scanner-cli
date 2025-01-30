import type { TUserChoices } from './cli'
import { getRecursiveFilesAndFolders } from './files'
import { getCommonFilesInFileMap, getUniversalFileMapFromFolders } from './logic'
import { applyFilesExtractionEffect, getRidOfDuplicatesInFoldersEffect } from './logic/effect'
import { defaultBanFolders } from './shared/constants'
import { asyncFlow } from './shared/helpers'
import { strategies } from './strategies'

export const main = async (options: TUserChoices) => {
  const folderList = options.recursive
    ? (await getRecursiveFilesAndFolders(options.folderPath as AbsolutePath, {
        permittedExtensions: [],
        banFolders: defaultBanFolders,
        flat: true,
      })) as string[]
    : (options.folderPaths || [options.folderPath]) as string[]

  await getRidOfDuplicatesInFoldersEffect(folderList, strategies, options)

  const extractCommonFilesInFolders = asyncFlow(
    getUniversalFileMapFromFolders(strategies, options),
    getCommonFilesInFileMap,
    applyFilesExtractionEffect(strategies, options)
  )

  await extractCommonFilesInFolders(folderList)
}
