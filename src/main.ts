import * as A from 'fp-ts/lib/Array'
import { flow, pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'

import type { TUserChoices } from './cli'
import { getRecursiveFilesAndFolders } from './files/readers'
import { getCommonFilesInFileMap, getUniversalFileMapFromFolders } from './logic/core'
import { applyFilesExtractionEffect, getRidOfDuplicatesInFoldersEffect } from './logic/effects'
import { DEFAULT_BAN_FOLDERS } from './shared/constants'
import { strategies } from './strategies'

const getFolderList = (
  options: Pick<TUserChoices, 'folderConfig' | 'recursive'>
): TE.TaskEither<Error, string[]> =>
  options.recursive
    ? getRecursiveFilesAndFolders(options.folderConfig[0] as AbsolutePath, {
        permittedExtensions: [],
        banFolders: DEFAULT_BAN_FOLDERS,
      })
    : TE.right(options.folderConfig)

export const main = (options: TUserChoices): TE.TaskEither<Error, void[]> => {
  const extractCommonFilesInFolders = flow(
    getUniversalFileMapFromFolders(strategies, options),
    TE.flatMap(mapEls => pipe(
      mapEls,
      getCommonFilesInFileMap,
      applyFilesExtractionEffect(strategies, options)
    )
    )
  )

  return pipe(
    TE.Do,
    TE.bind('folderList', () => getFolderList(options)),
    TE.flatMap(({ folderList }) =>
      A.sequence(TE.ApplicativeSeq)([
        getRidOfDuplicatesInFoldersEffect(folderList, strategies, options),
        extractCommonFilesInFolders(folderList),
      ])
    )
  )
}
