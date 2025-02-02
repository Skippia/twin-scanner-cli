import type * as TE from 'fp-ts/TaskEither'

import type { TUserChoices } from './cli'
import { getRecursiveFilesAndFolders } from './files/readers'
import { getCommonFilesInFileMap, getUniversalFileMapFromFolders } from './logic/core'
import { applyFilesExtractionEffect, getRidOfDuplicatesInFoldersEffect } from './logic/effects'
import { DEFAULT_BAN_FOLDERS } from './shared/constants'
import { asyncFlow } from './shared/helpers'
import { strategies } from './strategies'

export const main = (options: TUserChoices): TE.TaskEither<Error, void> => {
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
