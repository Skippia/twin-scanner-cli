import type { TExtensionsRemoveDuplicatesStrategies } from '..'
import type { TExtractorsUsefulInfo } from '../../logic/types'

import type { TUserChoices } from '@/cli'

export type TGetDuplicatesFromTxtFilesInFolder = (strategy: Readonly<TExtensionsRemoveDuplicatesStrategies['txt']>) => (
  folder: AbsolutePath,
) => Promise<
  Record<
    AbsolutePath,
    {
      unique: readonly string[]
      duplicates: readonly string[]
      duplicatesLength: number
      uniqueLength: number
    }
  >
>

export type TTxtFileInfoExtractor = TExtractorsUsefulInfo['txt']

export type TApplyFileExtractionEffect = (
  strategies: TExtensionsRemoveDuplicatesStrategies,
  options: Readonly<TUserChoices>,
) => (fileMapExtraction: readonly Record<Filename, AbsolutePath[]>[]) => Promise<void>
