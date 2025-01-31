import type { TDuplicateFormatTorrent } from './types'

import { removeFilesEffect } from '@/files/effect'

export const removeDuplicatesTorrentEffect = async (
  torrentFileDuplicates: Readonly<TDuplicateFormatTorrent>,
  readonly: boolean
) => await removeFilesEffect({ readonly })(torrentFileDuplicates.flatMap(v => v.pathsForDuplicateFiles))
