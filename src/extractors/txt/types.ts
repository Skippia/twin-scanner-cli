import type { TExtensionsRemoveDuplicatesStrategies, TExtractorsUsefulInfo } from '../../logic/types'

import type { AbsolutePath } from '@/types'

export type TGetDuplicatesFromTxtFilesInFolder = (strategy: TExtensionsRemoveDuplicatesStrategies['txt']) => (
  folder: AbsolutePath,
) => Promise<
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
