import type * as TE from 'fp-ts/lib/TaskEither'

import type { TUserChoices } from '@/cli'
import type { UFileExtension } from '@/shared/constants'
import type { TExtensionsRemoveDuplicatesStrategies } from '@/strategies'

export type TFileInfo = {
  readonly ext: ExtractorFileExtensions
  readonly content: string | null
  readonly absolutePath: string
  readonly filename: string
}

export type ExtractorFileExtensions = Readonly<(typeof UFileExtension)[keyof typeof UFileExtension]>
export type TExtractInfoFromFile = (filePath: AbsolutePath) => TE.TaskEither<Error, TFileInfo>

export type TExtractorsUsefulInfo = {
  readonly [UFileExtension.TORRENT]: (file: TFileInfo) => string
  readonly [UFileExtension.TXT]: (file: TFileInfo) => string[]
}

export type TMoveFilesInFolders = (options: {
  readonly readonly: boolean
}) => (commonFiles: Readonly<Record<string, AbsolutePath[]>>) => TE.TaskEither<Error, void>

export type TUpdateContentInTxtFilesEffect = (converter: (filename: string) => string) => (
  fileContentMap: Readonly<
    Record<
      AbsolutePath,
      {
        readonly unique: string[]
      }
    >
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

export type TGetCommonFilesInFileMap = (
  universalFileMap: TMonogenousUniversalMapEl[],
) => Readonly<Record<Filename, AbsolutePath[]>>[]

export type TGetUniversalFileMapFromFolder = (
  folder: string,
  strategies: TExtensionsRemoveDuplicatesStrategies,
) => TE.TaskEither<Error, THeterogenousUniversalMapEl[]>

export type TContent = {
  filename: string
  content: string[]
}

export type THeterogenousUniversalMapEl =
  | {
    readonly folder: string
    readonly type: (typeof UFileExtension)['TXT']
    readonly content: {
      readonly filename: string
      readonly content: string[]
    }[]
  }
  | {
    readonly folder: string
    readonly type: (typeof UFileExtension)['TORRENT']
    readonly content: string[]
  }

export type TMonogenousUniversalMapEl = {
  readonly folderOrFilename: string
  readonly type: ExtractorFileExtensions
  readonly content: string[]
  readonly amount: number
}
