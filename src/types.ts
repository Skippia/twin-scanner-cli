/*
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ Literal types                                                           │
  └─────────────────────────────────────────────────────────────────────────┘
 */

export type RelativePath = string
export type AbsolutePath = string
export type Filename = string
export type FilenameNoExt = string

/*
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ Helper types                                                            │
  └─────────────────────────────────────────────────────────────────────────┘
 */

export type TTask<T> = () => Promise<T>
export type TFileInfo = {
  ext: ExtractorFileExtensions
  content: string | null
  absolutePath: string
  filename: string
}

export const UFileExtension = {
  TXT: 'txt',
  TORRENT: 'torrent',
} as const

export type ExtractorFileExtensions = (typeof UFileExtension)[keyof typeof UFileExtension]
export type TFileExtensionNameMap = {
  [UFileExtension.TXT]: string[] // content
  [UFileExtension.TORRENT]: FilenameNoExt // filename without extension
}

export type TExtractorsUsefulInfo = {
  [UFileExtension.TORRENT]: (file: TFileInfo) => string
  [UFileExtension.TXT]: (file: TFileInfo) => string[]
}
export type TTreeFileNaming = Record<AbsolutePath, Omit<TFileInfo, 'absolutePath'>>

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

/*
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ Signature types                                                         │
  └─────────────────────────────────────────────────────────────────────────┘
 */
export type TGetUniqueNames = (sourceArr: string[]) => string[]
export type TExtractInfoFromFile = (filePath: AbsolutePath) => Promise<TFileInfo>
export type TGetDuplicatesInFolderTorrent = (strategy: TExtensionsRemoveDuplicatesStrategies['torrent']) => (
  folder: AbsolutePath,
) => Promise<{
  paths: AbsolutePath[]
  uniqueLength: number
  duplicateLength: number
  fileOrFolder: string
}>

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

export type TRemoveFiles = (options: { readonly: boolean }) => (files: AbsolutePath[]) => Promise<void>
export type TTxtFileInfoExtractor = TExtractorsUsefulInfo['txt']
export type TTorrentFileInfoExtractor = TExtractorsUsefulInfo['torrent']
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
export type TUpdateContentInTxtFiles = (options: {
  readonly: boolean
}) => (fileContentMap: Awaited<ReturnType<ReturnType<TGetDuplicatesFromTxtFilesInFolder>>>) => Promise<void>

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
