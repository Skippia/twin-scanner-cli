import type { AbsolutePath } from '../types'

export type TRemoveFiles = (options: { readonly: boolean }) => (files: AbsolutePath[]) => Promise<void>
