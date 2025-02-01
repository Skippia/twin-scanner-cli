import type { ExtractorFileExtensions } from '../logic/types'

export type TRemoveFilesEffect = (options: {
  readonly readonly: boolean
}) => (files: ReadonlyArray<AbsolutePath>) => Promise<void[] | undefined>

export type TGetRecursiveFilesAndFolders = (
  folder: AbsolutePath,
  options: {
    readonly permittedExtensions: ReadonlyArray<ExtractorFileExtensions>
    readonly flat: boolean
    readonly banFolders: ReadonlyArray<string>
  },
) => Promise<ReadonlyArray<AbsolutePath> | { folders: ReadonlyArray<AbsolutePath>, files: ReadonlyArray<AbsolutePath> }>
