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
export type TExtractInfoFromFile = (filePath: AbsolutePath) => Promise<TFileInfo>

export type TExtractorsUsefulInfo = {
  readonly [UFileExtension.TORRENT]: (file: TFileInfo) => string
  readonly [UFileExtension.TXT]: (file: TFileInfo) => ReadonlyArray<string>
}

export type TMoveFilesInFolders = (options: {
  readonly readonly: boolean
}) => (commonFiles: { readonly [key: string]: ReadonlyArray<AbsolutePath> }) => Promise<void>

export type TUpdateContentInTxtFilesEffect = (
  converter: (filename: string) => string,
  options: { readonly readonly: boolean },
) => (fileContentMap: {
  readonly [key: AbsolutePath]: {
    readonly unique: ReadonlyArray<string>
  }
}) => Promise<void[] | undefined>

/**
 * @example
 * { 'filename.ext': ['/path/to/file1.ext', '/path/to/file2.ext'] }
 */

export type TGetUniversalFileMapFromFolders = (
  strategies: TExtensionsRemoveDuplicatesStrategies,
  options: TUserChoices,
) => (folderList: ReadonlyArray<string>) => Promise<ReadonlyArray<TMonogenousUniversalMapEl>>

export type TGetCommonFilesInFileMap = (
  universalFileMap: ReadonlyArray<TMonogenousUniversalMapEl>,
) => ReadonlyArray<{ readonly [key: Filename]: ReadonlyArray<AbsolutePath> }>

export type TGetUniversalFileMapFromFolder = (
  folder: string,
  strategies: TExtensionsRemoveDuplicatesStrategies,
) => Promise<ReadonlyArray<THeterogenousUniversalMapEl>>

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
  readonly content: ReadonlyArray<string>
  readonly amount: number
}
