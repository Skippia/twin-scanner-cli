import * as A from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'

import type { TDuplicateFormatTorrent } from './types'

import { removeFilesEffect } from '@/files/effects'

export const removeDuplicatesTorrentEffect = (
  torrentFileDuplicates: TDuplicateFormatTorrent,
  readonly: boolean
): TE.TaskEither<Error, void[]> =>
  readonly
    ? TE.right([])
    : pipe(
        torrentFileDuplicates,
        A.flatMap(v => v.pathsForDuplicateFiles),
        removeFilesEffect
      )
