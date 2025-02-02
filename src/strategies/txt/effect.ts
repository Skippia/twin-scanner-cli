import type * as TE from 'fp-ts/TaskEither'

import type { TDuplicateFormatTxt } from '../torrent/types'

import { convertTorrentFilenameToURL } from './helpers'

import { writeIntoFileEffect } from '@/files/effects'
import { getFileContentFromTxt } from '@/files/readers'
import type { TUpdateContentInTxtFilesEffect } from '@/logic/types'

export const updateContentInTxtFilesEffect: TUpdateContentInTxtFilesEffect
  = (converter, options) =>  (fileMap) => {
    if (options.readonly) return

    const writeToFilesTasks = Object.entries(fileMap).reduce<Promise<void>[]>((acc, [absolutePath, contentMap]) => {
      const writeToFileTask = writeIntoFileEffect(absolutePath, contentMap.unique.map(converter).join('\n'))
      return [...acc, writeToFileTask]
    }, [])

    return await Promise.all(writeToFilesTasks)
  }

export const removeContentFromTxtFileEffect =  (
  pathToTxtFile: AbsolutePath,
  stringToDelete: string
): TE.TaskEither<Error, void> => {
  const rawContent = await getFileContentFromTxt(pathToTxtFile)
  const parsedContent = rawContent.split('\n')
  const updatedContent = parsedContent.filter(v => v !== stringToDelete).join('\n')

  return writeIntoFileEffect(pathToTxtFile, updatedContent)
}

export const removeDuplicatesFromTxtFileEffect = (
  txtFilesMapDuplicates: TDuplicateFormatTxt,
  readonly: boolean
): TE.TaskEither<Error, void> =>
  Promise.all(txtFilesMapDuplicates.map(updateContentInTxtFilesEffect(convertTorrentFilenameToURL, { readonly })))
