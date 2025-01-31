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

declare type TTask<T> = () => Promise<T>
declare type AsyncFunction<T = unknown, R = unknown> = (arg: T) => Promise<R>
declare type SyncFunction<T = unknown, R = unknown> = (arg: T) => R
declare type AnyFunction<T = unknown, R = unknown> = AsyncFunction<T, R> | SyncFunction<T, R>

declare type ReadonlyDeep<T> = Readonly<{
  [K in keyof T]:
  // Is it a primitive? Then make it readonly
  T[K] extends (number | string | symbol) ? Readonly<T[K]>
    // Is it an array of items? Then make the array readonly and the item as well
    : T[K] extends Array<infer A> ? Readonly<Array<DeepReadonly<A>>>
    // It is some other object, make it readonly as well
      : DeepReadonly<T[K]>;
}>
