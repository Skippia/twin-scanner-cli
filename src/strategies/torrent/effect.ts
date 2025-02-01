import type { TDuplicateFormatTorrent } from './types'

import { removeFilesEffect } from '@/files/effect'

export const removeDuplicatesTorrentEffect = async (
  torrentFileDuplicates: TDuplicateFormatTorrent,
  readonly: boolean
): Promise<void[] | undefined> =>
  await removeFilesEffect({ readonly })(torrentFileDuplicates.flatMap(v => v.pathsForDuplicateFiles))
