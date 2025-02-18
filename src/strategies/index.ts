import { torrentDuplicateStrategy } from './torrent/index'
import { txtDuplicateStrategy } from './txt/index'
import type { TExtensionsRemoveDuplicatesStrategies } from './types'

export const strategies: TExtensionsRemoveDuplicatesStrategies = {
  txt: txtDuplicateStrategy,
  torrent: torrentDuplicateStrategy,
}
