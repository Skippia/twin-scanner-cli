export type RelativePath = string
export type AbsolutePath = string
export type Filename = string
export type FilenameNoExt = string

export type TFileInfo = {
  content: string
  absolutePath: string
  filename: string
  ext: string
}

export type ExtractorFileExtensions = 'txt' | 'torrent'
export type TFileExtensionNameMap = {
  'txt': string[] // content
  'torrent': FilenameNoExt // filename without extension
}

export type TExtractors = Record<ExtractorFileExtensions, (file: TFileInfo) => string[]>
export type TTreeFileNaming = Record<AbsolutePath, {
  ext: ExtractorFileExtensions
  info: TFileExtensionNameMap[ExtractorFileExtensions]
  absolutePath: string
}>


export type TExtensionsRemoveDuplicatesStrategies = {
  'txt': {
    extractor: TExtractors['txt']
    actionCallback: (lines: string[]) => string
  }
  'torrent': {
    extractor: TExtractors['torrent']
    isConsideredDuplicate: (file1: TFileInfo, file2: TFileInfo) => boolean
  }
}
