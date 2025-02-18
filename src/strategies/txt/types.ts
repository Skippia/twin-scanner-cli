import type * as TE from 'fp-ts/lib/TaskEither'

import type { TExtractorsUsefulInfo, TUserChoices } from '../../logic/types'
import type { TExtensionsRemoveDuplicatesStrategies } from '../types'

export type TGetDuplicatesFromTxtFilesInFolder = (
  strategy: TExtensionsRemoveDuplicatesStrategies['txt'],
) => (folder: AbsolutePath) => TE.TaskEither<
  Error,
  Record<
    AbsolutePath,
    {
      unique: string[]
      duplicates: string[]
      duplicatesLength: number
      uniqueLength: number
    }
  >
>

export type TTxtFileInfoExtractor = TExtractorsUsefulInfo['txt']

export type TApplyFileExtractionEffect = (
  strategies: TExtensionsRemoveDuplicatesStrategies,
  options: TUserChoices,
) => (fileMapExtraction: Record<Filename, AbsolutePath[]>[]) => TE.TaskEither<Error, void>
