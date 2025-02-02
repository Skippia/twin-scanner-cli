import fsSync from 'node:fs'
import fs from 'node:fs/promises'

import * as E from 'fp-ts/Either'
import type * as IO from 'fp-ts/IO'
import * as IOE from 'fp-ts/IOEither'
import { pipe } from 'fp-ts/lib/function'
import type * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'

export const unlinkTE = (path: string): TE.TaskEither<Error, void> => TE.tryCatchK(fs.unlink, E.toError)(path)

export const mkdirTE = (path: string): TE.TaskEither<Error, string | undefined> =>
  TE.tryCatchK(fs.mkdir, E.toError)(path)

export const writeFileTE = (path: string, content: string): TE.TaskEither<Error, void> =>
  TE.tryCatchK(fs.writeFile, E.toError)(path, content, { encoding: 'utf-8' })

export const renameTE = (oldPath: string, newPath: string): TE.TaskEither<Error, void> =>
  TE.tryCatchK(fs.rename, E.toError)(oldPath, newPath)

export const appendFileTE = (path: string, content: string): TE.TaskEither<Error, void> =>
  TE.tryCatchK(fs.appendFile, E.toError)(path, content, { encoding: 'utf-8' })

export const readDirTE = (folder: string): TE.TaskEither<Error, string[]> =>
  TE.tryCatch(() => fs.readdir(folder), E.toError)

export const getFileContentFromTxtTE = (filePath: string): TE.TaskEither<Error, string> =>
  TE.tryCatch(() => fs.readFile(filePath, { encoding: 'utf-8' }), E.toError)

export const checkIfDirectoryT = (fullPath: string): T.Task<boolean> =>
  () => fs
    .stat(fullPath)
    .then(stats => stats.isDirectory())
    .catch(() => false)

export const checkIsFolderExistsT = (pathToFolder: string): T.Task<boolean> =>
  pipe(
    TE.tryCatch(() => fs.access(pathToFolder), E.toError),
    TE.match(
      () => {
        console.warn(`Folder ${pathToFolder} not exists`)
        return false
      },
      () => true
    )
  )

export const validateFolderPath = (folderPath: string): IO.IO<string | boolean> =>
  pipe(
    IOE.Do,
    IOE.apS('exists', IOE.tryCatchK(fsSync.existsSync, E.toError)(folderPath)),
    IOE.apS('stats', IOE.tryCatchK(fsSync.statSync, E.toError)(folderPath)),
    IOE.flatMap(({ exists, stats }) =>
      exists && stats?.isDirectory() ? IOE.right(true) : IOE.left(new Error('Please provide a valid folder path'))
    ),
    IOE.matchW(
      ({ message }) => message,
      () => true
    )
  )
