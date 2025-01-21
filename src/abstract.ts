import fs from 'node:fs/promises'
import path from 'node:path'

import { pipe } from 'fp-ts/lib/function'

import { convertToOutput, getAbsPathFolders, torrentDuplicateStrategy, txtDuplicateStrategy } from './files'
import type {
  ExtractorFileExtensions,
  TExtractInfoFromFile,
  TGetDuplicatesFromTxtFilesInFolder,
  TGetDuplicateTorrentsFilesInFolder,
} from './types'

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

const getDuplicateTorrentsFilesInFolder: TGetDuplicateTorrentsFilesInFolder = strategy => async (folder) => {
  const filenames = await fs.readdir(folder)
  const torrentFilenames = filenames.filter(filename => path.extname(filename) === '.torrent')

  const fileInfoArr = await Promise.all(
    torrentFilenames.map(filename => extractInfoFromFile(path.join(folder, filename)))
  )

  const isConsideredDuplicate = strategy.isConsideredDuplicate(fileInfoArr.map(v => v.filename))

  const duplicateAbsolutePaths = fileInfoArr.reduce<string[]>(
    (acc, cur) => (isConsideredDuplicate(cur) ? [...acc, cur.absolutePath] : acc),
    []
  )

  return duplicateAbsolutePaths
}

const getDuplicatesFromTxtFiles: TGetDuplicatesFromTxtFilesInFolder = strategy => async (folder) => {
  const filenames = await fs.readdir(folder)
  const txtFilenames = filenames.filter(filename => path.extname(filename) === '.txt')

  const fileInfoArr = await Promise.all(
    txtFilenames.map(filename => extractInfoFromFile(path.join(folder, filename)))
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
    {}
  )

  return updateMapFiles
}

async function main() {
  // const folderList = ['0.extra-gold', 'folder1', 'folder2'].map(n => `../../tt/${n}`)
  const folderList = ['../../tt']

  const readonly = false

  const getDuplicatesInFoldersTxt = async (folderList: string[]) =>
    await pipe(folderList, getAbsPathFolders, folders =>
      Promise.all(folders.map(getDuplicatesFromTxtFiles(txtDuplicateStrategy))))

  const getDuplicatesInFoldersTorrent = async (folderList: string[]) =>
    await pipe(folderList, getAbsPathFolders, folders =>
      Promise.all(folders.map(getDuplicateTorrentsFilesInFolder(torrentDuplicateStrategy))))

  const txtFileMapArr = await getDuplicatesInFoldersTxt(folderList)
  // await Promise.all(txtFileMapArr.map(updateContentInTxtFiles({ readonly })))

  const formatted = convertToOutput({ readonly })(txtFileMapArr)

  console.table(formatted)

  // await removeDuplicatesInFoldersTorrent(folderList, { readonly })
  // await extractDuplicateFiles(folderList, { readonly })
}

main()
