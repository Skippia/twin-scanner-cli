import type * as TE from 'fp-ts/TaskEither'

import type { TExtensionsRemoveDuplicatesStrategies } from '..'
import type { TExtractorsUsefulInfo } from '../../logic/types'

import type { TUserChoices } from '@/cli'

export type TGetDuplicatesFromTxtFilesInFolder = (strategy: TExtensionsRemoveDuplicatesStrategies['txt']) => (
  folder: AbsolutePath,
) => TE.TaskEither<
  Error,
  Record<
    AbsolutePath,
    {
      readonly unique: Array<string>
      readonly duplicates: Array<string>
      readonly duplicatesLength: number
      readonly uniqueLength: number
    }
  >
>

export type TTxtFileInfoExtractor = TExtractorsUsefulInfo['txt']

export type TApplyFileExtractionEffect = (
  strategies: TExtensionsRemoveDuplicatesStrategies,
  options: TUserChoices,
) => (fileMapExtraction: Array<Readonly<Record<Filename, Array<AbsolutePath>>>>) => TE.TaskEither<Error, void>
