import type { TGetDuplicatesInFoldersTxt } from '../torrent/types'

export type TOutputFormatTxt = {
  filename: string
  amount_all_names: number
  amount_unique_names: number
  amount_duplicates_names: number
  readonlyMode: boolean
}[]
export type TConvertToOutputTxt = (options: {
  readonly: boolean
}) => (raw: Awaited<ReturnType<TGetDuplicatesInFoldersTxt>>) => TOutputFormatTxt

export const convertToOutputTxt: TConvertToOutputTxt = options => raw =>
  raw.flatMap(val =>
    Object.entries(val).map(([absolutePath, ctx]) => ({
      filename: absolutePath,
      amount_all_names: ctx.duplicatesLength + ctx.uniqueLength,
      amount_unique_names: ctx.uniqueLength,
      amount_duplicates_names: ctx.duplicatesLength,
      readonlyMode: options.readonly,
    }))
  )
