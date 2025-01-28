import path from 'node:path'

import type { _ } from 'node_modules/inquirer/dist/esm/ui/prompt'

import { readDir } from '../files'
import { filterRecordByKeys, getCombinations } from '../shared/helpers'

import { getFilesInfo } from './helpers'
import type {
  ExtractorFileExtensions,
  TContent,
  TFileInfo,
  TGetCommonFilesInFileMap,
  TGetUniversalFileMapFromFolder,
  TGetUniversalFileMapFromFolders,
  THeterogenousUniversalMapEl,
  TMonogenousUniversalMapEl,
} from './types'

export const convertHeteroUniversalMapToMono = (
  heterogenousUniversalMap: THeterogenousUniversalMapEl[]
): TMonogenousUniversalMapEl[] => {
  const arr: TMonogenousUniversalMapEl[][] = heterogenousUniversalMap
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
    })

  return arr.flatMap(v => v)
}

export const getUniversalFileMapFromFolder: TGetUniversalFileMapFromFolder = async (folder, strategies) => {
  const extensions = Object.keys(strategies) as ExtractorFileExtensions[]
  const filenames = await readDir(folder)

  const filenamesMapByExts = await extensions.reduce(
    async (acc, ext) => {
      const filenamesByExt = filenames.filter(filename => path.extname(filename) === `.${ext}`)
      const filesInfo = await getFilesInfo({ folder, filenames: filenamesByExt })

      return [
        ...(await acc),
        {
          ext,
          filesInfo,
        },
      ]
    },
    Promise.resolve([] as Array<{ ext: ExtractorFileExtensions, filesInfo: TFileInfo[] }>) as Promise<
      Array<{ ext: ExtractorFileExtensions, filesInfo: TFileInfo[] }>
    >
  )

  const contentMapByExts = filenamesMapByExts
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

  const heterogeneousMapEl = contentMapByExts.reduce((acc, cur) => {
    const content
      = cur.ext === 'txt'
        ? (cur.info as TContent[]).map(content => ({ filename: content.filename, content: content.content }))
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

  return heterogeneousMapEl
}

export const getUniversalFileMapFromFolders: TGetUniversalFileMapFromFolders
  = (strategies, options) => async (folderList) => {
    const filteredStrategies = filterRecordByKeys(strategies, options.fileExtensions)

    const heterogeneousUniversalMapNested = await Promise.all(
      folderList.map(folder => getUniversalFileMapFromFolder(folder, filteredStrategies))
    )

    const heterogeneousUniversalMap = heterogeneousUniversalMapNested.flatMap(v => v)

    return convertHeteroUniversalMapToMono(heterogeneousUniversalMap)
  }

export const getCommonFilesInFileMap: TGetCommonFilesInFileMap = (universalFileMap) => {
  const absolutePaths = universalFileMap.map(v => v.folderOrFilename)
  const allPossibleCombinations = getCombinations(absolutePaths)

  const commonFilesMap = allPossibleCombinations
    .reduce((acc, folderOrFilenames) => {
      // const files1 = universalFileMap.find(el => el.folderOrFilename === folderOrFilename1)!
      // const files2 = universalFileMap.find(el => el.folderOrFilename === folderOrFilename2)!
      const files = folderOrFilenames
        .map(
          folderOrFilename => universalFileMap.find(el => el.folderOrFilename === folderOrFilename)!
        )
        .sort((a, b) => a.amount > b.amount ? -1 : 1)

      const sourceMapEl = files.at(0)!
      const targetMapEls = files.slice(1)

      const fileMap = sourceMapEl.content.reduce(
        (acc, curFilename) => {
          // const isDuplicate = targetMapEl.content.includes(curFilename)
          const isDuplicate = targetMapEls.every(targetMapEl => targetMapEl.content.includes(curFilename))

          if (isDuplicate) {
            const pathsToDuplicateFiles = targetMapEls.map(targetMapEl => targetMapEl.type === 'torrent'
              ? path.join(targetMapEl.folderOrFilename, curFilename)
              : targetMapEl.folderOrFilename)

            return {
              ...acc,
              [curFilename]: [
                sourceMapEl.type === 'torrent'
                  ? path.join(sourceMapEl.folderOrFilename, curFilename)
                  : sourceMapEl.folderOrFilename,
                ...pathsToDuplicateFiles,
              ],
            }
          }
          return acc
        },
        {} as ReturnType<TGetCommonFilesInFileMap>[0]
      )

      return [...acc, fileMap]
    }, [] as ReturnType<TGetCommonFilesInFileMap>)
    .filter(el => Object.keys(el).length > 0)


    
  return commonFilesMap
}
