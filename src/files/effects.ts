import fs from 'node:fs/promises'

import * as A from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'

import { getOnlyFolders } from './readers'
import { appendFileTE, mkdirTE, renameTE, unlinkTE, writeFileTE } from './system-operations'

const recursivelyRemoveEmptyFoldersEffect = (
  folders: AbsolutePath[]
): TE.TaskEither<Error, void> => {
  if (folders.length === 0) return TE.right(undefined)

  const [current, ...remaining] = folders

  return pipe(
    TE.tryCatch(() => fs.readdir(current!), E.toError),
    TE.flatMap(files =>
      files.length === 0
        ? pipe(
            TE.tryCatch(() => fs.rmdir(current!), E.toError),
            TE.flatMap(() => recursivelyRemoveEmptyFoldersEffect(remaining))
          )
        : recursivelyRemoveEmptyFoldersEffect(remaining)
    )
  )
}

export const removeEmptyFoldersInFolderEffect = (
  folderPath: AbsolutePath
): TE.TaskEither<Error, void> =>
  pipe(folderPath, getOnlyFolders, TE.flatMap(recursivelyRemoveEmptyFoldersEffect))

export const createFolderEffect = mkdirTE
export const writeIntoFileEffect = writeFileTE
export const moveFileEffect = renameTE
export const appendIntoTxtFileEffect = appendFileTE

export const removeFilesEffect = (filenamePaths: AbsolutePath[]): TE.TaskEither<Error, void[]> =>
  pipe(filenamePaths, A.map(unlinkTE), A.sequence(TE.ApplicativePar))
