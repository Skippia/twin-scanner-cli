import * as R from "remeda";
import fs from 'node:fs/promises'
import { flow, pipe } from "fp-ts/lib/function";
import * as A from 'fp-ts/lib/Array'
import type { AbsolutePath, TExtensionsRemoveDuplicatesStrategies, TExtractors, TTreeFileNaming, Filename } from "./types";
import { getAbsPathFolders } from "./files";

declare const getDuplicateFilesInFolder: (options: {
  strategies: TExtensionsRemoveDuplicatesStrategies
}) => (folder: AbsolutePath) => AbsolutePath[]
declare const removeFiles: (options: { readonly: boolean }) => (files: AbsolutePath[]) => Promise<void>
declare const TxtFileInfoExtractor: TExtractors['txt']
declare const TorrentFileInfoExtractor: TExtractors['torrent']
declare const buildFilenamesTreeFromFolders: (options: { extractors: TExtractors }) => (folders: AbsolutePath[]) => TTreeFileNaming
/**
 * Record<Filename, AbsolutePath[]> where
 * Filename is duplicate filename
 * AbsolutePath is path to file
 * @example 
 * { 'filename.ext': ['/path/to/file1.ext', '/path/to/file2.ext'] }
 */
declare const findCommonFilesInFileTree: (fileTree: TTreeFileNaming) => Record<Filename, AbsolutePath[]>
declare const moveFilesInFolders: (options: { readonly: boolean }) => (commonFiles: Record<Filename, AbsolutePath[]>) => Promise<void>
declare const strategies: TExtensionsRemoveDuplicatesStrategies

async function main() {
  const folderList = ['0.extra-gold,txt', '1.now.txt', '2.gold.txt']

  const readonly = true

  const removeDuplicatesInFolders = (folderList: string[], options: { readonly: boolean }) => pipe(
    folderList,
    getAbsPathFolders,
    A.flatMap(getDuplicateFilesInFolder({
      strategies,
    })),
    removeFiles({ readonly: options.readonly }),
  )

  const extractDuplicateFiles = (folderList: string[], options: { readonly: boolean }) => pipe(
    folderList,
    getAbsPathFolders,
    buildFilenamesTreeFromFolders({
      extractors: { txt: TxtFileInfoExtractor, torrent: TorrentFileInfoExtractor }
    }),
    findCommonFilesInFileTree,
    moveFilesInFolders({ readonly: options.readonly }),
  )

  await removeDuplicatesInFolders(folderList, { readonly })
  await extractDuplicateFiles(folderList, { readonly })
}


main()
