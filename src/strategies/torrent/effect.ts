import type * as TE from 'fp-ts/TaskEither'

import type { TDuplicateFormatTorrent } from './types'

import { removeFilesEffect } from '@/files/effects'

export const removeDuplicatesTorrentEffect = (
  torrentFileDuplicates: TDuplicateFormatTorrent,
  readonly: boolean
): TE.TaskEither<Error, void> =>
  removeFilesEffect({ readonly })(torrentFileDuplicates.flatMap(v => v.pathsForDuplicateFiles))
