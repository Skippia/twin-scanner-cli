import path from 'node:path'

import * as A from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'

import { filterRecordByKeys, getCombinationsGenerator, ordUniversalMapEl } from './helpers'
import { getFilesInfo } from './readers'
import type {
  ExtractorFileExtensions,
  TContent,
  TFileInfo,
  TGetUniversalFileMapFromFolders,
  THeterogenousUniversalMapEl,
  TMonogenousUniversalMapEl,
} from './types'

import { readDirTE } from '@/files/system-operations'
import type { TExtensionsRemoveDuplicatesStrategies } from '@/strategies'

const getFilesInfoByExt = (filenames: string[], folder: string) =>
  (
    ext: ExtractorFileExtensions
  ): TE.TaskEither<
    Error,
    {
      ext: ExtractorFileExtensions
      filesInfo: TFileInfo[]
    }
  > =>
    pipe(
      filenames,
      A.filter(filename => path.extname(filename) === `.${ext}`),
      filenamesByExt => getFilesInfo(folder)(filenamesByExt),
      TE.map(filesInfo => ({ ext, filesInfo }))
    )

const buildFilenamesMapByExts = (
  folder: string,
  extensions: ExtractorFileExtensions[]
): TE.TaskEither<
  Error,
  {
    ext: ExtractorFileExtensions
    filesInfo: TFileInfo[]
  }[]
> =>
  pipe(
    folder,
    readDirTE,
    TE.flatMap(filenames =>
      pipe(extensions, A.traverse(TE.ApplicativePar)(getFilesInfoByExt(filenames, folder)))
    )
  )

export const convertHeteroUniversalMapToMono = (
  heterogenousUniversalMap: THeterogenousUniversalMapEl[]
): TMonogenousUniversalMapEl[] => {
  const arr = heterogenousUniversalMap
    .filter(v => Object.keys(v).length > 0)
    .map((v) => {
      if (v.type === 'txt') {
        return v.content.map(txtSubContent => ({
          folderOrFilename: txtSubContent.filename,
          type: v.type,
          amount: txtSubContent.content.length,
          content: txtSubContent.content,
        }))
      }

      return [
        {
          folderOrFilename: v.folder,
          type: v.type,
          amount: v.content.length,
          content: v.content,
        },
      ]
    }) as TMonogenousUniversalMapEl[][]

  return arr.flatMap(v => v)
}

export const processCombination = (
  filesMapCache: Record<AbsolutePath, TMonogenousUniversalMapEl>,
  folderOrFilenames: string[]
): Record<string, string[]> => {
  const files = pipe(
    folderOrFilenames,
    A.map(folderOrFilename => filesMapCache[folderOrFilename]!),
    A.sort(ordUniversalMapEl)
  )

  const [sourceMapEl, ...targetMapEls] = files

  return pipe(
    sourceMapEl!.content,
    A.reduce({} as Record<string, string[]>, (acc, curFilename) => {
      const isDuplicate = targetMapEls.every(targetMapEl =>
        targetMapEl.content.includes(curFilename)
      )

      if (isDuplicate) {
        const pathsToDuplicateFiles = pipe(
          targetMapEls,
          A.map(targetMapEl =>
            targetMapEl.type === 'torrent'
              ? path.join(targetMapEl.folderOrFilename, curFilename)
              : targetMapEl.folderOrFilename
          )
        )

        return {
          ...acc,
          [curFilename]: [
            sourceMapEl!.type === 'torrent'
              ? path.join(sourceMapEl!.folderOrFilename, curFilename)
              : sourceMapEl!.folderOrFilename,
            ...pathsToDuplicateFiles,
          ],
        }
      }

      return acc
    })
  )
}

export const buildCommonFilesMap = (
  filesMapCache: Record<AbsolutePath, TMonogenousUniversalMapEl>,
  combinationsGenerator: Generator<string[]>
): Record<Filename, AbsolutePath[]>[] => {
  const resultGenerator = function* (
    combinationsGenerator: Generator<string[]>
  ): Generator<Record<string, string[]>> {
    // eslint-disable-next-line functional/no-loop-statements
    for (const combination of combinationsGenerator) {
      const fileMap = processCombination(filesMapCache, combination)

      // eslint-disable-next-line functional/no-conditional-statements
      if (Object.keys(fileMap).length > 0) {
        yield fileMap
      }
    }
  }

  return [...resultGenerator(combinationsGenerator)]
}

export const getUniversalFileMapFromFolder = (
  folder: string,
  strategies: TExtensionsRemoveDuplicatesStrategies
): TE.TaskEither<Error, THeterogenousUniversalMapEl[]> =>
  pipe(
    Object.keys(strategies) as ExtractorFileExtensions[],
    extensions => buildFilenamesMapByExts(folder, extensions),
    TE.map(filenamesMapByExts =>
      filenamesMapByExts
        .map(({ ext, filesInfo }) => ({
          ext,
          info:
            ext === 'torrent'
              ? filesInfo.map(torrentFileInfo => strategies[ext].extractor(torrentFileInfo))
              : filesInfo.map(txtFileInfo => ({
                  filename: txtFileInfo.absolutePath,
                  content: strategies[ext].extractor(txtFileInfo),
                })),
        }))
        // Remove empty txt of empty torrent field
        .filter(v => v.info.length > 0)
        .reduce((acc, cur) => {
          const content
            = cur.ext === 'txt'
              ? (cur.info as TContent[]).map(content => ({
                  filename: content.filename,
                  content: content.content,
                }))
              : cur.info

          const el = [
            ...acc,
            {
              folder,
              type: cur.ext,
              content,
            } as THeterogenousUniversalMapEl,
          ]

          return el
        }, [] as THeterogenousUniversalMapEl[])
    )
  )

export const getUniversalFileMapFromFolders: TGetUniversalFileMapFromFolders
  = (strategies, options) => (folderList) => {
    const filteredStrategies = filterRecordByKeys(strategies, options.fileExtensions)

    return pipe(
      folderList,
      A.traverse(TE.ApplicativePar)(folder =>
        getUniversalFileMapFromFolder(folder, filteredStrategies)
      ),
      TE.map(A.flatten),
      TE.map(convertHeteroUniversalMapToMono)
    )
  }

export const getCommonFilesInFileMap = (
  universalFileMap: TMonogenousUniversalMapEl[]
): Record<Filename, AbsolutePath[]>[] => {
  const absolutePaths = universalFileMap.map(v => v.folderOrFilename)
  const nextCombinationGenerator = getCombinationsGenerator(absolutePaths)

  const filesMapCache: Record<AbsolutePath, TMonogenousUniversalMapEl> = absolutePaths.reduce(
    (acc, folderOrFilename) =>
      ({
        ...acc,
        [folderOrFilename]: universalFileMap.find(el => el.folderOrFilename === folderOrFilename),
      }) satisfies Record<AbsolutePath, TMonogenousUniversalMapEl>,
    {}
  )

  const commonFilesMap = buildCommonFilesMap(filesMapCache, nextCombinationGenerator)

  return commonFilesMap
}
