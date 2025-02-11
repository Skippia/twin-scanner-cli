import type TE from 'fp-ts/lib/TaskEither'

import type { ExtractorFileExtensions } from '../logic/types'

export type TRemoveFilesEffect = (files: AbsolutePath[]) => TE.TaskEither<Error, void[]>

export type TGetRecursiveFilesAndFolders = (
  folder: AbsolutePath,
  options: {
    readonly permittedExtensions: ExtractorFileExtensions[]
    readonly banFolders: string[]
  },
) => TE.TaskEither<Error, AbsolutePath[]>
