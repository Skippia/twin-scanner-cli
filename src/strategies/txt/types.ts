import type * as TE from 'fp-ts/lib/TaskEither'

import type { TExtensionsRemoveDuplicatesStrategies } from '..'
import type { TExtractorsUsefulInfo } from '../../logic/types'

import type { TUserChoices } from '@/cli'

export type TGetDuplicatesFromTxtFilesInFolder = (
  strategy: TExtensionsRemoveDuplicatesStrategies['txt'],
) => (folder: AbsolutePath) => TE.TaskEither<
  Error,
  Record<
    AbsolutePath,
    {
      readonly unique: string[]
      readonly duplicates: string[]
      readonly duplicatesLength: number
      readonly uniqueLength: number
    }
  >
>

export type TTxtFileInfoExtractor = TExtractorsUsefulInfo['txt']

export type TApplyFileExtractionEffect = (
  strategies: TExtensionsRemoveDuplicatesStrategies,
  options: TUserChoices,
) => (fileMapExtraction: Readonly<Record<Filename, AbsolutePath[]>>[]) => TE.TaskEither<Error, void>
