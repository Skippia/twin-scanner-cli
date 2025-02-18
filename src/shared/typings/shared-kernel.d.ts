/* eslint-disable import/unambiguous */
/*
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ Literal types                                                           │
  └─────────────────────────────────────────────────────────────────────────┘
 */

declare type RelativePath = string
declare type AbsolutePath = string

declare type Filename = string
declare type AbsFilename = string

declare type Foldername = string
declare type AbsFoldername = string

declare type FilenameNoExt = string
declare type AbsFilenameNoExt = string

/*
    ┌─────────────────────────────────────────────────────────────────────────┐
    │ Helper types                                                            │
    └─────────────────────────────────────────────────────────────────────────┘
*/

declare type AsyncFunction<T = unknown, R = unknown> = (arg: T) => Promise<R>
declare type SyncFunction<T = unknown, R = unknown> = (arg: T) => R
declare type AnyFunction<T = unknown, R = unknown> = AsyncFunction<T, R> | SyncFunction<T, R>
