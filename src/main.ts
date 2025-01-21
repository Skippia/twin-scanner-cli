import path from 'node:path';
import { checkIsFolderExists, getAllFilesInFolder, scanFiles, moveFiles, filenameIsInAllFolders, getAbsPathFolder } from './files';
import { validateUserArgs } from './helpers';


async function main(targetFolders: string[], options:{ readonly?: boolean } = {}) {
  options.readonly ??= true
  console.log(options.readonly, typeof options.readonly)

  const isSomeFolderNotExist = (
    await Promise.all(targetFolders.map(checkIsFolderExists))).some(isExists => !isExists
    )

  if (isSomeFolderNotExist) return

  // 1. Scan filenames for duplicates specific for each folder
  const filesData1 = await getAllFilesInFolder(targetFolders)
  const uniqueFilenamePaths = filesData1.flatMap(({ parentFolder, filenames }) => 
    [...scanFiles(parentFolder, filenames)])

  if (!options.readonly) {
    // 2. Move duplicates to separate folder
    await moveFiles({
      filenamePaths: uniqueFilenamePaths,
      destRelativeFolder: duplicateFromBothFoldersFolder
    })
  }

  // 3. Scan filename for cross-folder duplicates
  const filesData2 = await getAllFilesInFolder(targetFolders)
  const fileMap = filesData2.reduce<Record<string, string[]>>((acc, { parentFolder, filenames }) => ({ ...acc, [parentFolder]: filenames }), {})
  const mergedFiles = [...new Set(Object.values(fileMap).flatMap(filenames => filenames))]
  const crossDuplicateFilenamePaths: string[] = []

  mergedFiles.forEach(filename => {
    const isCrossFolderFilenameDuplicate = filenameIsInAllFolders({ filename, fileMap })

    if (isCrossFolderFilenameDuplicate) {
      console.log('Cross file duplicate:', filename)
      crossDuplicateFilenamePaths.push(...targetFolders.map(folder => getAbsPathFolder(folder, filename)))
    }
  })

  if (!options.readonly) {
    // 2. Move cross duplicates to separate folder
    await moveFiles({
      filenamePaths: crossDuplicateFilenamePaths,
      destRelativeFolder: commonFilesFolder
    })
  }

  console.dir({
    uniqueDuplicates: uniqueFilenamePaths,
    crossDuplicateFilenamePaths: [...new Set(crossDuplicateFilenamePaths.map(filename => path.basename(filename)))]
  }, {
    depth: null
  })
}





// const duplicateFromBothFoldersFolder = './duplicate-files'
// const commonFilesFolder = './common-files'
const duplicateFromBothFoldersFolder = '/mnt/x/torrents/duplicate-files'
const commonFilesFolder = '/mnt/x/torrents/common-files'

const { folders, readonly } = validateUserArgs()

main(folders, {
  readonly
})

