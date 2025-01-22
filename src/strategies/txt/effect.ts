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

      acc.push(writeToFileTask)

      return acc
    }, [])

    await Promise.all(writeToFilesTasks)
  }

export const removeContentFromTxtFileEffect = async (src: AbsolutePath, stringToDelete: string) => {
  const rawContent = await getFileContentFromTxt(src)
  const parsedContent = rawContent.split('\n')
  const updatedContent = parsedContent.filter(v => v !== stringToDelete).join('\n')

  await writeIntoFileEffect(src, updatedContent)
}

export const removeDuplicatesFromTxtFileEffect = async (
  txtFilesMapDuplicates: TDuplicateFormatTxt,
  readonly: boolean
) => {
  await Promise.all(txtFilesMapDuplicates.map(updateContentInTxtFilesEffect(convertTorrentFilenameToURL, { readonly })))
}
