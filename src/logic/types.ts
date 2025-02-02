import type * as TE from 'fp-ts/TaskEither'

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
  readonly [UFileExtension.TXT]: (file: TFileInfo) => ReadonlyArray<string>
}

export type TMoveFilesInFolders = (options: {
  readonly readonly: boolean
}) => (commonFiles: { readonly [key: string]: ReadonlyArray<AbsolutePath> }) => TE.TaskEither<Error, void>

export type TUpdateContentInTxtFilesEffect = (
  converter: (filename: string) => string,
  options: { readonly readonly: boolean },
) => (fileContentMap: {
  readonly [key: AbsolutePath]: {
    readonly unique: ReadonlyArray<string>
  }
}) => TE.TaskEither<Error, void>

/**
 * @example
 * { 'filename.ext': ['/path/to/file1.ext', '/path/to/file2.ext'] }
 */
export type TGetUniversalFileMapFromFolders = (
  strategies: TExtensionsRemoveDuplicatesStrategies,
  options: TUserChoices,
) => (folderList: string[]) => TE.TaskEither<Error, ReadonlyArray<TMonogenousUniversalMapEl>>

export type TGetCommonFilesInFileMap = (
  universalFileMap: ReadonlyArray<TMonogenousUniversalMapEl>,
) => ReadonlyArray<{ readonly [key: Filename]: ReadonlyArray<AbsolutePath> }>

export type TGetUniversalFileMapFromFolder = (
  folder: string,
  strategies: TExtensionsRemoveDuplicatesStrategies,
) => TE.TaskEither<Error, THeterogenousUniversalMapEl[]>

export type TContent = {
  filename: string
  content: ReadonlyArray<string>
}

export type THeterogenousUniversalMapEl =
  | {
    readonly folder: string
    readonly type: (typeof UFileExtension)['TXT']
    readonly content: ReadonlyArray<{
      readonly filename: string
      readonly content: ReadonlyArray<string>
    }>
  }
  | {
    readonly folder: string
    readonly type: (typeof UFileExtension)['TORRENT']
    readonly content: ReadonlyArray<string>
  }

export type TMonogenousUniversalMapEl = {
  readonly folderOrFilename: string
  readonly type: ExtractorFileExtensions
  readonly content: string[]
  readonly amount: number
}
