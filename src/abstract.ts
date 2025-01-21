import fs from 'node:fs/promises'
import path from 'node:path'

import { pipe } from 'fp-ts/lib/function'

import {
  getAbsPathFolders,
  removeFiles,
  torrentDuplicateStrategy,
  txtDuplicateStrategy,
  updateContentInTxtFiles,
} from './files'
import type {
  ExtractorFileExtensions,
  TExtractInfoFromFile,
  TGetDuplicatesFromTxtFilesInFolder,
  TGetDuplicatesInFolderTorrent,
} from './types'
import { convertToOutputUniversal } from './formatters'

const extractInfoFromFile: TExtractInfoFromFile = async (filePath) => {
  const ext = path.extname(filePath).slice(1) as ExtractorFileExtensions
  const filename = path.basename(filePath)
  const content = ext === 'txt' ? await fs.readFile(filePath, { encoding: 'utf-8' }) : null

  return {
    absolutePath: filePath,
    content,
    ext,
    filename,
  }
}

const getDuplicateTorrentsFilesInFolder: TGetDuplicatesInFolderTorrent = (strategy) => async (folder) => {
  const filenames = await fs.readdir(folder)

  const torrentFilenames = filenames.filter((filename) => path.extname(filename) === '.torrent')

  const fileInfoArr = await Promise.all(
    torrentFilenames.map((filename) => extractInfoFromFile(path.join(folder, filename))),
  )

  const isConsideredDuplicate = strategy.isConsideredDuplicate(fileInfoArr.map((v) => v.filename))

  const duplicateAbsolutePaths = fileInfoArr.reduce<Awaited<ReturnType<ReturnType<TGetDuplicatesInFolderTorrent>>>>(
    (acc, cur) => {
      acc.fileOrFolder = folder

      const isDuplicate = isConsideredDuplicate(cur)

      if (isDuplicate) {
        return {
          ...acc,
          paths: [...acc.paths, cur.absolutePath],
          duplicateLength: acc.duplicateLength + 1,
        }
      }
      return {
        ...acc,
        uniqueLength: acc.uniqueLength + 1,
      }
    },
    {
      paths: [],
      fileOrFolder: '',
      uniqueLength: 0,
      duplicateLength: 0,
    },
  )

  return duplicateAbsolutePaths
}

const getDuplicatesFromTxtFiles: TGetDuplicatesFromTxtFilesInFolder = (strategy) => async (folder) => {
  const filenames = await fs.readdir(folder)
  const txtFilenames = filenames.filter((filename) => path.extname(filename) === '.txt')

  const fileInfoArr = await Promise.all(
    txtFilenames.map((filename) => extractInfoFromFile(path.join(folder, filename))),
  )

  const updateMapFiles = fileInfoArr.reduce<Awaited<ReturnType<ReturnType<TGetDuplicatesFromTxtFilesInFolder>>>>(
    (acc, cur) => {
      const usefulContent = strategy.extractor(cur)
      const uniqueNames = strategy.getUniqueNames(usefulContent)
      const duplicateNames = strategy.getDuplicates(usefulContent, uniqueNames)
      const duplicatesLength = duplicateNames.length
      const uniqueLength = uniqueNames.length

      return {
        ...acc,
        [cur.absolutePath]: {
          duplicates: duplicateNames,
          unique: uniqueNames,
          duplicatesLength,
          uniqueLength,
        },
      }
    },
    {},
  )
  return updateMapFiles
}

async function main() {
  const folderList = [
    ...['2.gold', '1.now', '3.popular', '4.bds', '5.rest', 'anime', 'games'].map((n) => `../../tt/fresh/${n}`),
    '../../tt/fresh',
  ]

  const readonly = true

  const getDuplicatesInFoldersTxt = async (folderList: string[]) => {
    const folders = pipe(folderList, getAbsPathFolders)
    
    return Promise.all(folders.map(getDuplicatesFromTxtFiles(txtDuplicateStrategy)))
  }


  const getDuplicatesInFoldersTorrent = async (folderList: string[]) => {
    const folders = pipe(folderList, getAbsPathFolders)
    const duplicates = await Promise.all(folders.map(getDuplicateTorrentsFilesInFolder(torrentDuplicateStrategy)))

    return duplicates.filter((v) => v.fileOrFolder !== '')
  }

  const txtFileMapArr = await getDuplicatesInFoldersTxt(folderList)
  const torrentFileDuplicates = await getDuplicatesInFoldersTorrent(folderList)

  // Remove duplicates from .txt-specific
  await Promise.all(txtFileMapArr.map(updateContentInTxtFiles({ readonly })))
  // Remove duplicates from .torrent-specific
  await removeFiles({ readonly })(torrentFileDuplicates.flatMap((v) => v.paths))

  const formatted = convertToOutputUniversal({ readonly })({ txt: txtFileMapArr, torrent: torrentFileDuplicates })

  console.table(formatted)

  // await removeDuplicatesInFoldersTorrent(folderList, { readonly })
  // await extractDuplicateFiles(folderList, { readonly })
}

void main()
