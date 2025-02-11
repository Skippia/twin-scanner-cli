import path from 'node:path'

import * as A from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'

import type { ExtractorFileExtensions, TExtractInfoFromFile, TFileInfo } from './types'

import { getFileContentFromTxtTE } from '@/files/system-operations'

export const extractInfoFromFile: TExtractInfoFromFile = (
  filePath
): TE.TaskEither<Error, TFileInfo> => {
  const ext = path.extname(filePath).slice(1) as ExtractorFileExtensions
  const filename = path.basename(filePath)

  return pipe(
    ext === 'txt' ? getFileContentFromTxtTE(filePath) : TE.right(''),
    TE.map(content => ({
      absolutePath: filePath,
      content: content || null,
      ext,
      filename,
    }))
  )
}

export const getFilesInfo
  = (folder: string) =>
    (filenames: string[]): TE.TaskEither<Error, TFileInfo[]> =>
      pipe(
        filenames,
        A.map(filename => extractInfoFromFile(path.join(folder, filename))),
        A.sequence(TE.ApplicativePar)
      )
