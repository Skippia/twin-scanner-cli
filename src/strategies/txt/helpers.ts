import path from 'node:path'

import type { TExtensionsRemoveDuplicatesStrategies } from '..'
import type { TDuplicateFormatTxt } from '../torrent/types'

import type { TGetDuplicatesFromTxtFilesInFolder } from './types'

import { readDir } from '@/files'
import { getFilesInfo, isOnlyDigits } from '@/logic/helpers'
import type { TFileInfo } from '@/logic/types'
import { environments } from '@/shared/environments'

export const extractTorrentFileNameFromURL = (url: string): string => {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname
    const params = new URLSearchParams(urlObj.search)
    const topicId = params.get('t')?.replace(/^t/, '') || ''

    return `[${domain}].t${topicId}.torrent`
  }
  catch (error) {
    console.error('[url]: ', url)
    throw new Error('invalid_url.torrent')
  }
}

export const convertTorrentFilenameToURL = (fileName: string): string => {
  const topicId = fileName.split('.')[2]?.slice(1)

  if (!isOnlyDigits(topicId)) {
    console.error('[filename]: ', fileName)
    throw new Error('invalid_filename.torrent')
  }

  return `${environments.TORRENT_URL}?t=${topicId}`
}

export const extractContentFromTxtFile = (file: TFileInfo) =>
  file.content
    ?.split('\n')
    .filter(v => Boolean(v))
    .map(extractTorrentFileNameFromURL) || ['']

export const getDuplicatesFromTxtFile = (lines: readonly string[]) =>
  lines.reduce<string[]>(
    (acc, cur, idx) => (lines.indexOf(cur, idx) !== lines.lastIndexOf(cur) ? [...acc, cur] : [...acc]),
    []
  )

const getDuplicateMapFromTxtFilesInFolder: TGetDuplicatesFromTxtFilesInFolder = strategy => async (folder) => {
  const filenames = await readDir(folder)
  const txtFilenames = filenames.filter(filename => path.extname(filename) === '.txt')

  const filesInfo = await getFilesInfo({
    folder,
    filenames: txtFilenames,
  })

  const updateTxtMapFiles = filesInfo.reduce(
    (acc, cur) => {
      const extractedContent = strategy.extractor(cur)
      const uniqueNames = strategy.getUniqueNames(extractedContent)
      const duplicateNames = strategy.getDuplicates(extractedContent, uniqueNames)

      return {
        ...acc,
        [cur.absolutePath]: {
          duplicates: duplicateNames,
          unique: uniqueNames,
          duplicatesLength: duplicateNames.length,
          uniqueLength: uniqueNames.length,
        },
      }
    },
    {} as Record<
      AbsolutePath,
      {
        unique: readonly string[]
        duplicates: readonly string[]
        duplicatesLength: number
        uniqueLength: number
      }
    >
  )

  return updateTxtMapFiles
}

/**
 * @description
 * Create duplicate maps for all .txt files in folders
 */
export const getDuplicateMapFromTxtFilesInFolders = async (
  folderList: readonly string[],
  options: { strategy: TExtensionsRemoveDuplicatesStrategies['txt'] }
): Promise<TDuplicateFormatTxt> =>
  await Promise.all(folderList.map(getDuplicateMapFromTxtFilesInFolder(options.strategy)))
