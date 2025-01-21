import type { TExtensionsRemoveDuplicatesStrategies, TExtractorsUsefulInfo } from '@/logic/types'
import type { AbsolutePath, RelativePath } from '@/types'

export type TTorrentFileInfoExtractor = TExtractorsUsefulInfo['torrent']

export type TGetDuplicatesInFolderTorrent = (strategy: TExtensionsRemoveDuplicatesStrategies['torrent']) => (
  folder: AbsolutePath,
) => Promise<{
  pathsForDuplicateFiles: AbsolutePath[]
  uniqueLength: number
  duplicateLength: number
  folder: string
}>

export type TGetDuplicatesInFoldersTxt = (folderList: RelativePath[]) => Promise<
  Record<
    string,
    {
      unique: string[]
      duplicates: string[]
      duplicatesLength: number
      uniqueLength: number
    }
  >[]
>
