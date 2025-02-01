import type { TUserChoices } from './cli'
import { getRecursiveFilesAndFolders } from './files'
import { getCommonFilesInFileMap, getUniversalFileMapFromFolders } from './logic'
import { applyFilesExtractionEffect, getRidOfDuplicatesInFoldersEffect } from './logic/effect'
import { DEFAULT_BAN_FOLDERS } from './shared/constants'
import { asyncFlow } from './shared/helpers'
import { strategies } from './strategies'

export const main = async (options: TUserChoices): Promise<void> => {
  const folderList = options.recursive
    ? ((await getRecursiveFilesAndFolders(options.folderPath as AbsolutePath, {
        permittedExtensions: [],
        banFolders: DEFAULT_BAN_FOLDERS,
        flat: true,
      })) as ReadonlyArray<string>)
    : ((options.folderPaths || [options.folderPath]) as ReadonlyArray<string>)

  return await getRidOfDuplicatesInFoldersEffect(folderList, strategies, options).then(() => {
    const extractCommonFilesInFolders = asyncFlow(
      getUniversalFileMapFromFolders(strategies, options),
      getCommonFilesInFileMap,
      applyFilesExtractionEffect(strategies, options)
    )

    return extractCommonFilesInFolders(folderList)
  })
}
