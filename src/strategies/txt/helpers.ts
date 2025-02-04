import path from 'node:path'

import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import { identity, pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/TaskEither'

import type { TExtensionsRemoveDuplicatesStrategies } from '..'
import type { TDuplicateFormatTxt } from '../torrent/types'

import type { TGetDuplicatesFromTxtFilesInFolder } from './types'

import { readDirTE } from '@/files/system-operations'
import { isOnlyDigits } from '@/logic/helpers'
import { getFilesInfo } from '@/logic/readers'
import type { TFileInfo } from '@/logic/types'
import { environments } from '@/shared/environments'

export const extractTorrentFileNameFromURL = (url: string): E.Either<Error, string> =>
  E.tryCatch(
    () => {
      const urlObj = new URL(url)
      const domain = urlObj.hostname
      const params = new URLSearchParams(urlObj.search)
      const topicId = params.get('t')?.replace(/^t/, '') || ''

      return `[${domain}].t${topicId}.torrent`
    },
    () => {
      console.error('[url]: ', url)
      // eslint-disable-next-line functional/no-throw-statements
      throw new Error('invalid_url.torrent')
    }
  )

export const convertTorrentFilenameToURL = (fileName: string): string => {
  const topicId = fileName.split('.')[2]?.slice(1)

  if (!isOnlyDigits(topicId)) {
    console.error('[filename]: ', fileName)
    // eslint-disable-next-line functional/no-throw-statements
    throw new Error('invalid_filename.torrent')
  }

  return `${environments.TORRENT_URL}?t=${topicId}`
}

export const extractContentFromTxtFile = (file: TFileInfo): string[] =>
  pipe(
    file.content?.split('\n') || [],
    A.filter(Boolean),
    A.traverse(E.Applicative)(extractTorrentFileNameFromURL),
    E.match(() => [], identity)
  )

export const getDuplicatesFromTxtFile = (lines: Array<string>): Array<string> =>
  lines.reduce<Array<string>>(
    (acc, cur, idx) => (lines.indexOf(cur, idx) !== lines.lastIndexOf(cur) ? [...acc, cur] : [...acc]),
    []
  )

const updateTxtMapFiles
  = (strategy: TExtensionsRemoveDuplicatesStrategies['txt']) =>
    (
      filesInfo: TFileInfo[]
    ): Record<
      string,
      {
        unique: Array<string>
        duplicates: Array<string>
        duplicatesLength: number
        uniqueLength: number
      }
    > =>
      filesInfo.reduce(
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
            unique: Array<string>
            duplicates: Array<string>
            duplicatesLength: number
            uniqueLength: number
          }
        >
      )

const getDuplicateMapFromTxtFilesInFolder: TGetDuplicatesFromTxtFilesInFolder = strategy => folder =>
  pipe(
    folder,
    readDirTE,
    TE.flatMap(filenames =>
      pipe(
        filenames,
        A.filter(filename => path.extname(filename) === '.txt'),
        getFilesInfo(folder),
        TE.map(updateTxtMapFiles(strategy))
      )
    )
  )

/**
 * @description
 * Create duplicate maps for all .txt files in folders
 */
export const getDuplicateMapFromTxtFilesInFolders = (
  folderList: Array<string>,
  options: { readonly strategy: TExtensionsRemoveDuplicatesStrategies['txt'] }
): TE.TaskEither<Error, TDuplicateFormatTxt> =>
  pipe(folderList, A.traverse(TE.ApplicativePar)(getDuplicateMapFromTxtFilesInFolder(options.strategy)))
