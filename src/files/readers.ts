import path from 'node:path'

import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'

import { checkIfDirectoryT, readDirTE } from './system-operations'
import type { TGetRecursiveFilesAndFolders } from './types'

import type { ExtractorFileExtensions } from '@/logic/types'

export const isNameInArrNames = ({
  name,
  arrNames,
}: {
  readonly name: string
  readonly arrNames: ReadonlyArray<string>
}): boolean => arrNames.every(names => names.includes(name))

const getFilesAndFoldersFromFolder = ({
  rootFolder,
  entries,
  folders,
  files,
  options,
}: {
  rootFolder: string
  entries: readonly string[]
  folders: readonly string[]
  files: readonly string[]
  options: {
    readonly permittedExtensions: ReadonlyArray<ExtractorFileExtensions>
    readonly banFolders: ReadonlyArray<string>
  }
}): TE.TaskEither<Error, { folders: readonly string[], files: readonly string[] }> => {
  if (entries.length === 0) {
    return TE.of({ folders: [...folders], files: [...files] })
  }

  const [currentEl, ...remainingEntries] = entries

  if (options.banFolders.includes(currentEl!)) {
    return getFilesAndFoldersFromFolder({ rootFolder, entries: remainingEntries, folders, files, options })
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
          TE.chain(childEntriesFullPath =>
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

      const isPermittedFile = options.permittedExtensions.some(ext => currentEl!.endsWith(`.${ext}`))
      return isPermittedFile
        ? getFilesAndFoldersFromFolder({
            rootFolder,
            entries: remainingEntries,
            folders,
            files: [...files, fullPath],
            options,
          })
        : getFilesAndFoldersFromFolder({ rootFolder, entries: remainingEntries, folders, files, options })
    })
  )
}

export const getRecursiveFilesAndFolders: TGetRecursiveFilesAndFolders = (
  folder,
  options
): TE.TaskEither<Error, string[]> =>
  pipe(
    readDirTE(folder),
    TE.chain(initialEntries =>
      getFilesAndFoldersFromFolder({ rootFolder: folder, entries: initialEntries, folders: [], files: [], options })
    ),
    TE.map(({ folders, files }) => [...folders, ...files])
  )
