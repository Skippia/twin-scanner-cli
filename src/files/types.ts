import type { ExtractorFileExtensions } from '../logic/types'

export type TRemoveFilesEffect = (options: Readonly<{ readonly: boolean }>) =>
(files: readonly AbsolutePath[]) => Promise<void[] | undefined>

export type TGetRecursiveFilesAndFolders = (
  folder: AbsolutePath,
  options: Readonly<{
    permittedExtensions: ExtractorFileExtensions[]
    flat: boolean
    banFolders: string[]
  }>,
) => Promise<AbsolutePath[] | { folders: AbsolutePath[], files: AbsolutePath[] }>
