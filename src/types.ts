import type { TFileInfo } from './logic/types'

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
export type TGetUniqueNames = (sourceArr: string[]) => string[]
export type TTreeFileNaming = Record<AbsolutePath, Omit<TFileInfo, 'absolutePath'>>
