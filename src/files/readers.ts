import path from 'node:path'

import * as A from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/function'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'

import { checkIfDirectoryT, readDirTE } from './system-operations'

import type { ExtractorFileExtensions } from '@/logic/types'

const accFolders
  = (folderPath: string) =>
    (entries: string[]): T.Task<string[]> =>
      pipe(
        entries,
        A.traverse(T.ApplicativeSeq)((fileOrFolder) => {
          const fullPath = path.join(folderPath, fileOrFolder)

          return pipe(
            fullPath,
            checkIfDirectoryT,
            T.map(isFolder => (isFolder ? [fullPath] : []))
          )
        }),
        T.map(A.flatten)
      )

const getFilesAndFoldersFromFolder = ({
  rootFolder,
  entries,
  folders,
  files,
  options,
}: {
  rootFolder: string
  entries: string[]
  folders: string[]
  files: string[]
  options: {
    permittedExtensions: ExtractorFileExtensions[]
    banFolders: string[]
  }
}): TE.TaskEither<Error, { folders: string[], files: string[] }> => {
  if (entries.length === 0) return TE.of({ folders: [...folders], files: [...files] })

  const [currentEl, ...remainingEntries] = entries

  if (options.banFolders.includes(currentEl!)) {
    return getFilesAndFoldersFromFolder({
      rootFolder,
      entries: remainingEntries,
      folders,
      files,
      options,
    })
  }

  const fullPath = path.join(rootFolder, currentEl!)

  return pipe(
    fullPath,
    checkIfDirectoryT,
    T.flatMap((isDirectory) => {
      if (isDirectory) {
        return pipe(
          readDirTE(fullPath),
          TE.map(childEntries => childEntries.map(child => path.join(currentEl!, child))),
          TE.flatMap(childEntriesFullPath =>
            getFilesAndFoldersFromFolder({
              rootFolder,
              entries: [...remainingEntries, ...childEntriesFullPath],
              folders: [...folders, fullPath],
              files,
              options,
            })
          )
        )
      }

      const isPermittedFile = options.permittedExtensions.some(ext =>
        currentEl!.endsWith(`.${ext}`)
      )

      return isPermittedFile
        ? getFilesAndFoldersFromFolder({
            rootFolder,
            entries: remainingEntries,
            folders,
            files: [...files, fullPath],
            options,
          })
        : getFilesAndFoldersFromFolder({
            rootFolder,
            entries: remainingEntries,
            folders,
            files,
            options,
          })
    })
  )
}

export const getRecursiveFilesAndFolders = (
  folder: AbsolutePath,
  options: {
    permittedExtensions: ExtractorFileExtensions[]
    banFolders: string[]
  }
): TE.TaskEither<Error, string[]> =>
  pipe(
    readDirTE(folder),
    TE.flatMap(initialEntries =>
      getFilesAndFoldersFromFolder({
        rootFolder: folder,
        entries: initialEntries,
        folders: [],
        files: [],
        options,
      })
    ),
    TE.map(({ folders, files }) => [...folders, ...files])
  )

export const getOnlyFolders = (folderPath: AbsolutePath): TE.TaskEither<Error, string[]> =>
  pipe(
    folderPath,
    readDirTE,
    TE.map(entries => pipe(entries, accFolders(folderPath))),
    TE.flatMap(task => TE.fromTask(task))
  )
