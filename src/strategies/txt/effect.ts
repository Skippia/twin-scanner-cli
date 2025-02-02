import * as TE from 'fp-ts/TaskEither'
import * as A from 'fp-ts/Array'
import * as S from 'fp-ts/string'

import type { TDuplicateFormatTxt } from '../torrent/types'

import { convertTorrentFilenameToURL } from './helpers'

import { writeIntoFileEffect } from '@/files/effects'
import type { TUpdateContentInTxtFilesEffect } from '@/logic/types'
import { getFileContentFromTxtTE } from '@/files/system-operations'
import { pipe } from 'fp-ts/lib/function'

const updateContentInTxtFilesEffect: TUpdateContentInTxtFilesEffect = (converter) => (fileMap) =>
  pipe(
    Object.entries(fileMap),
    A.map(([absolutePath, contentMap]) => pipe(
      contentMap.unique,
      A.map(converter),
      A.intercalate(S.Monoid)('\n'),
      writeIntoFileEffect(absolutePath)
    )),
    A.sequence(TE.ApplicativePar),
  )


export const removeContentFromTxtFileEffect = (
  pathToTxtFile: AbsolutePath,
  stringToDelete: string
): TE.TaskEither<Error, void> => pipe(
  pathToTxtFile,
  getFileContentFromTxtTE,
  TE.map(rawContent => rawContent.split('\n')),
  TE.flatMap(parsedContent => pipe(
    parsedContent,
    A.filter(v => v !== stringToDelete),
    A.intercalate(S.Monoid)('\n'),
    updatedContent => pipe(
      updatedContent,
      writeIntoFileEffect(pathToTxtFile)
    )
  ))
)



export const removeDuplicatesFromTxtFileEffect = (
  txtFilesMapDuplicates: TDuplicateFormatTxt,
  readonly: boolean
): TE.TaskEither<Error, void[][]> => readonly
    ? TE.right([])
    : pipe(
      txtFilesMapDuplicates,
      A.traverse(TE.ApplicativePar)(updateContentInTxtFilesEffect(convertTorrentFilenameToURL))
    )
