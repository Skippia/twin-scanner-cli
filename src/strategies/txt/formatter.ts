export type TOutputFormatTxt = readonly {
  readonly filename: string
  readonly amount_all_names: number
  readonly amount_unique_names: number
  readonly amount_duplicates_names: number
  readonly readonlyMode: boolean
}[]

export type TConvertToOutputTxt = (options: { readonly readonly: boolean }) => (
  raw: Array<
    Readonly<
      Record<
        string,
        {
          readonly unique: Array<string>
          readonly duplicates: Array<string>
          readonly duplicatesLength: number
          readonly uniqueLength: number
        }
      >
    >
  >,
) => TOutputFormatTxt

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
