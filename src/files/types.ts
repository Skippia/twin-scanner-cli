import type TE from 'fp-ts/TaskEither'

import type { ExtractorFileExtensions } from '../logic/types'

export type TRemoveFilesEffect = (files: AbsolutePath[]) => TE.TaskEither<Error, void[]>

export type TGetRecursiveFilesAndFolders = (
  folder: AbsolutePath,
  options: {
    readonly permittedExtensions: Array<ExtractorFileExtensions>
    readonly banFolders: Array<string>
  },
) => TE.TaskEither<Error, AbsolutePath[]>
