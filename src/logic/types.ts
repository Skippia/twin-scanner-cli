import type * as TE from 'fp-ts/lib/TaskEither'

import type { UFileExtension } from '@/shared/constants'
import type { TExtensionsRemoveDuplicatesStrategies } from '@/strategies/types'

export type TFileInfo = {
  ext: ExtractorFileExtensions
  content: string | null
  absolutePath: string
  filename: string
}

export type ExtractorFileExtensions = (typeof UFileExtension)[keyof typeof UFileExtension]

export type TExtractorsUsefulInfo = {
  [UFileExtension.TORRENT]: (file: TFileInfo) => string
  [UFileExtension.TXT]: (file: TFileInfo) => string[]
}

export type TUpdateContentInTxtFilesEffect = (converter: (filename: string) => string) => (
  fileContentMap: Record<
    AbsolutePath,
    {
      unique: string[]
    }
  >,
) => TE.TaskEither<Error, void[]>

/**
 * @example
 * { 'filename.ext': ['/path/to/file1.ext', '/path/to/file2.ext'] }
 */
export type TGetUniversalFileMapFromFolders = (
  strategies: TExtensionsRemoveDuplicatesStrategies,
  options: TUserChoices,
) => (folderList: string[]) => TE.TaskEither<Error, TMonogenousUniversalMapEl[]>

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

export type TUserChoices = {
  folderMode: 'single' | 'multiple'
  folderConfig: string[]
  fileExtensions: string[]
  rootFolder: string
  recursive: boolean
  readonly: boolean
}
