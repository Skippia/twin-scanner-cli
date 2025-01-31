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
  [UFileExtension.TORRENT]: (file: Readonly<TFileInfo>) => string
  [UFileExtension.TXT]: (file: Readonly<TFileInfo>) => string[]
}

export type TMoveFilesInFolders = (options: Readonly<{
  readonly: boolean
}>) => (commonFiles: Record<Filename, AbsolutePath[]>) => Promise<void>

export type TUpdateContentInTxtFilesEffect = (
  converter: (filename: string) => string,
  options: Readonly<{ readonly: boolean }>,
) => (
  fileContentMap: Record<
    AbsolutePath,
    {
      unique: readonly string[]
    }
  >,
) => Promise<void[] | undefined>

/**
 * @example
 * { 'filename.ext': ['/path/to/file1.ext', '/path/to/file2.ext'] }
 */

export type TGetUniversalFileMapFromFolders = (
  strategies: TExtensionsRemoveDuplicatesStrategies,
  options: Readonly<TUserChoices>,
) => (folderList: readonly string[]) => Promise<TMonogenousUniversalMapEl[]>

export type TGetCommonFilesInFileMap = (universalFileMap: readonly TMonogenousUniversalMapEl[]) => Record<
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
