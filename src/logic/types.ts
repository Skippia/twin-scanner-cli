import type { AbsolutePath, Filename, TTreeFileNaming } from '../types'

export const UFileExtension = {
  TXT: 'txt',
  TORRENT: 'torrent',
} as const

export type TFileInfo = {
  ext: ExtractorFileExtensions
  content: string | null
  absolutePath: string
  filename: string
}

export type ExtractorFileExtensions = (typeof UFileExtension)[keyof typeof UFileExtension]
export type TExtractInfoFromFile = (filePath: AbsolutePath) => Promise<TFileInfo>

export type TExtensionsRemoveDuplicatesStrategies = {
  [UFileExtension.TXT]: {
    extractor: TExtractorsUsefulInfo['txt']
    getUniqueNames: (lines: string[]) => string[]
    getDuplicates: (lines: string[], uniqueLines: string[]) => string[]
  }
  [UFileExtension.TORRENT]: {
    extractor: TExtractorsUsefulInfo['torrent']
    isConsideredDuplicate: (filenames: string[]) => (curFile: TFileInfo) => boolean
  }
}

export type TExtractorsUsefulInfo = {
  [UFileExtension.TORRENT]: (file: TFileInfo) => string
  [UFileExtension.TXT]: (file: TFileInfo) => string[]
}

export type TBuildFilenamesTreeFromFolders = (options: {
  extractors: TExtractorsUsefulInfo
}) => (folders: AbsolutePath[]) => TTreeFileNaming

/**
 * Record<Filename, AbsolutePath[]> where
 * Filename is duplicate filename
 * AbsolutePath is path to file
 * @example
 * { 'filename.ext': ['/path/to/file1.ext', '/path/to/file2.ext'] }
 */
export type TFindCommonFilesInFileTree = (fileTree: TTreeFileNaming) => Record<Filename, AbsolutePath[]>

export type TMoveFilesInFolders = (options: {
  readonly: boolean
}) => (commonFiles: Record<Filename, AbsolutePath[]>) => Promise<void>
export type TUpdateContentInTxtFiles = (options: { readonly: boolean }) => (
  fileContentMap: Record<
    AbsolutePath,
    {
      unique: string[]
    }
  >,
) => Promise<void>
