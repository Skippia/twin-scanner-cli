import fs from 'node:fs/promises'
import path from 'node:path'

import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'

import { appendFileTE, checkIfDirectory, mkdirTE, readDirTE, renameTE, unlinkTE, writeFileTE } from './system-operations'
import type { TRemoveFilesEffect } from './types'

export const createFolderEffect = mkdirTE
export const writeIntoFileEffect = writeFileTE
export const moveFileEffect = renameTE
export const appendIntoTxtFileEffect = appendFileTE

export const removeFilesEffect: TRemoveFilesEffect = filenamePaths => pipe(
  filenamePaths,
  A.map(unlinkTE),
  A.sequence(TE.ApplicativePar)
)

const recursivelyRemoveEmptyFolders = (folders: readonly AbsolutePath[]): TE.TaskEither<Error, void> => {
  if (folders.length === 0) {
    return TE.right(undefined)
  }

  const [current, ...remaining] = folders

  return pipe(
    TE.tryCatch(
      () => fs.readdir(current!),
      E.toError
    ),
    TE.flatMap(files =>
      files.length === 0
        ? pipe(
            TE.tryCatch(
              () => fs.rmdir(current!),
              E.toError
            ),
            TE.flatMap(() => recursivelyRemoveEmptyFolders(remaining))
          )
        : recursivelyRemoveEmptyFolders(remaining)
    )
  )
}

const getOnlyFolders = (folderPath: AbsolutePath): TE.TaskEither<Error, string[]> => pipe(
  folderPath,
  readDirTE,
  TE.flatMap(entries => pipe(
    entries,
    TE.tryCatchK(
      () => entries.reduce(async (accP, fileOrFolder) => {
        const acc = await accP
        const fullPath = path.join(folderPath, fileOrFolder)
        const isFolder = await checkIfDirectory(fullPath)
        return isFolder ? [...acc, fullPath] : acc
      }, Promise.resolve([] as string[])),
      E.toError
    )
  ))

)

export const removeEmptyFoldersInFolderEffect = (
  folderPath: AbsolutePath
): TE.TaskEither<Error, void> =>
  pipe(
    folderPath,
    getOnlyFolders,
    TE.flatMap(recursivelyRemoveEmptyFolders)
  )
