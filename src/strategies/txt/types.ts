import type { TExtensionsRemoveDuplicatesStrategies } from '..'
import type { TExtractorsUsefulInfo } from '../../logic/types'

import type { TUserChoices } from '@/cli'

export type TGetDuplicatesFromTxtFilesInFolder = (strategy: TExtensionsRemoveDuplicatesStrategies['txt']) => (
  folder: AbsolutePath,
) => Promise<{
  [key: AbsolutePath]: {
    readonly unique: ReadonlyArray<string>
    readonly duplicates: ReadonlyArray<string>
    readonly duplicatesLength: number
    readonly uniqueLength: number
  }
}>

export type TTxtFileInfoExtractor = TExtractorsUsefulInfo['txt']

export type TApplyFileExtractionEffect = (
  strategies: TExtensionsRemoveDuplicatesStrategies,
  options: TUserChoices,
) => (fileMapExtraction: ReadonlyArray<{ readonly [key: Filename]: ReadonlyArray<AbsolutePath> }>) => Promise<void>
