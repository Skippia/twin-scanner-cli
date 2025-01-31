import type { TDuplicateFormatTxt } from '../torrent/types'

import { convertTorrentFilenameToURL } from './helpers'

import { getFileContentFromTxt } from '@/files'
import { writeIntoFileEffect } from '@/files/effect'
import type { TUpdateContentInTxtFilesEffect } from '@/logic/types'

export const updateContentInTxtFilesEffect: TUpdateContentInTxtFilesEffect
  = (converter, options) => async (fileMap) => {
    if (options.readonly) return

    const writeToFilesTasks = Object.entries(fileMap).reduce<Promise<void>[]>((acc, [absolutePath, contentMap]) => {
      const writeToFileTask = writeIntoFileEffect(absolutePath, contentMap.unique.map(converter).join('\n'))
      return [...acc, writeToFileTask]
    }, [])

    return await Promise.all(writeToFilesTasks)
  }

export const removeContentFromTxtFileEffect
  = async (pathToTxtFile: AbsolutePath, stringToDelete: string): Promise<void> => {
    const rawContent = await getFileContentFromTxt(pathToTxtFile)
    const parsedContent = rawContent.split('\n')
    const updatedContent = parsedContent.filter(v => v !== stringToDelete).join('\n')

    return await writeIntoFileEffect(pathToTxtFile, updatedContent)
  }

export const removeDuplicatesFromTxtFileEffect = async (
  txtFilesMapDuplicates: Readonly<TDuplicateFormatTxt>,
  readonly: boolean
): Promise<(void[] | undefined)[]> => await Promise.all(
  txtFilesMapDuplicates.map(updateContentInTxtFilesEffect(convertTorrentFilenameToURL, { readonly }))
)
