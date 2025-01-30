import type { TExtensionsRemoveDuplicatesStrategies } from '..'
import type { TExtractorsUsefulInfo } from '../../logic/types'

import type { TUserChoices } from '@/cli'

export type TGetDuplicatesFromTxtFilesInFolder = (strategy: TExtensionsRemoveDuplicatesStrategies['txt']) => (
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
  options: TUserChoices,
) => (fileMapExtraction: Record<Filename, AbsolutePath[]>[]) => Promise<void>
