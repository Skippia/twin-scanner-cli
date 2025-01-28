import type { ExtractorFileExtensions } from '../logic/types'

export type TRemoveFilesEffect = (options: { readonly: boolean }) => (files: AbsolutePath[]) => Promise<void>

export type TGetRecursiveFilesAndFolders = (
  folder: AbsolutePath,
  options: {
    permittedExtensions: ExtractorFileExtensions[]
    flat: boolean
    banFolders: string[]
  },
) => Promise<AbsolutePath[] | { folders: AbsolutePath[], files: AbsolutePath[] }>
