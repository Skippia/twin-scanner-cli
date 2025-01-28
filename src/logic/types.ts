import type { TUserChoices } from '@/cli'
import type { UFileExtension } from '@/shared/constants'
import type { TExtensionsRemoveDuplicatesStrategies } from '@/strategies'

export type TFileInfo = {
  ext: ExtractorFileExtensions
  content: string | null
  absolutePath: string
  filename: string
}

export type ExtractorFileExtensions = (typeof UFileExtension)[keyof typeof UFileExtension]
export type TExtractInfoFromFile = (filePath: AbsolutePath) => Promise<TFileInfo>

export type TExtractorsUsefulInfo = {
  [UFileExtension.TORRENT]: (file: TFileInfo) => string
  [UFileExtension.TXT]: (file: TFileInfo) => string[]
}

export type TMoveFilesInFolders = (options: {
  readonly: boolean
}) => (commonFiles: Record<Filename, AbsolutePath[]>) => Promise<void>

export type TUpdateContentInTxtFilesEffect = (
  converter: (filename: string) => string,
  options: { readonly: boolean },
) => (
  fileContentMap: Record<
    AbsolutePath,
    {
      unique: string[]
    }
  >,
) => Promise<void>

/**
 * @example
 * { 'filename.ext': ['/path/to/file1.ext', '/path/to/file2.ext'] }
 */

export type TGetUniversalFileMapFromFolders = (
  strategies: TExtensionsRemoveDuplicatesStrategies,
  options: TUserChoices,
) => (folderList: string[]) => Promise<TMonogenousUniversalMapEl[]>

export type TGetCommonFilesInFileMap = (universalFileMap: TMonogenousUniversalMapEl[]) => Record<
  Filename,
  AbsolutePath[]
  /**
   * @example
   * {
   *  'cat.torrent': ['folder1/cat.torrent', 'folder2/animals.txt'],.
   *  'dog.torrent': ['folder1/dog.torrent', 'folder2/dog.torrent'],.
   * }
   */
>[]

export type TGetUniversalFileMapFromFolder = (
  folder: string,
  strategies: TExtensionsRemoveDuplicatesStrategies,
) => Promise<THeterogenousUniversalMapEl[]>

export type TContent = {
  filename: string
  content: string[]
}

export type THeterogenousUniversalMapEl =
  | {
    folder: string
    type: (typeof UFileExtension)['TXT']
    content: {
      filename: string
      content: string[]
    }[]
  }
  | {
    folder: string
    type: (typeof UFileExtension)['TORRENT']
    content: string[]
  }

export type TMonogenousUniversalMapEl = {
  folderOrFilename: string
  type: ExtractorFileExtensions
  content: string[]
  amount: number
}
