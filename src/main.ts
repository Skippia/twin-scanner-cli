import type { TUserChoices } from './cli'
import { getRecursiveFilesAndFolders } from './files'
import { getCommonFilesInFileMap, getUniversalFileMapFromFolders } from './logic'
import { applyFilesExtractionEffect, getRidOfDuplicatesInFoldersEffect } from './logic/effect'
import { defaultBanFolders } from './shared/constants'
import { asyncFlow } from './shared/helpers'
import { strategies } from './strategies'

export async function main(options: TUserChoices) {
  let folderList = (options.folderPaths || [options.folderPath]) as string[]

  if (options.recursive) {
    folderList = (await getRecursiveFilesAndFolders(options.folderPath as AbsolutePath, {
      permittedExtensions: [],
      banFolders: defaultBanFolders,
      flat: true,
    })) as string[]
  }

  console.log('Options:', { ...options, folderList })

  await getRidOfDuplicatesInFoldersEffect(folderList, strategies, options)

  const extractCommonFilesInFolders = asyncFlow(
    getUniversalFileMapFromFolders(strategies, options),
    getCommonFilesInFileMap,
    applyFilesExtractionEffect(strategies, options)
  )

  await extractCommonFilesInFolders(folderList)
}
