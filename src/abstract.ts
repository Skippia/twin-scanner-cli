import { getDuplicateTorrentsFilesInFolders } from './extractors'
import { torrentDuplicateStrategy } from './extractors/torrent'
import { getDuplicateMapFromTxtFilesInFolders, txtDuplicateStrategy } from './extractors/txt'
import { removeFiles } from './files'
import { convertToOutputUniversal } from './formatters'
import { updateContentInTxtFiles } from './logic'

async function main(options: { readonly: boolean }) {
  const folderList = [
    ...['2.gold', '1.now', '3.popular', '4.bds', '5.rest', 'anime', 'games'].map(n => `../../../tt/fresh/${n}`),
    '../../../tt/fresh',
  ]

  const txtFilesMapDuplicates = await getDuplicateMapFromTxtFilesInFolders(folderList, {
    strategy: txtDuplicateStrategy,
  })

  const torrentFileDuplicates = await getDuplicateTorrentsFilesInFolders(folderList, {
    strategy: torrentDuplicateStrategy,
  })

  // Remove duplicates from .txt-specific
  await Promise.all(txtFilesMapDuplicates.map(updateContentInTxtFiles({ readonly: options.readonly })))
  // Remove duplicates from .torrent-specific
  await removeFiles({ readonly: options.readonly })(torrentFileDuplicates.flatMap(v => v.pathsForDuplicateFiles))

  const formatted = convertToOutputUniversal({ readonly: options.readonly })({
    txt: txtFilesMapDuplicates,
    torrent: torrentFileDuplicates,
  })

  console.table(formatted)

  // await removeDuplicatesInFoldersTorrent(folderList, { readonly })
  // await extractDuplicateFiles(folderList, { readonly })
}

void main({ readonly: true })
