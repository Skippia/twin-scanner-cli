import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import * as IOE from 'fp-ts/lib/IOEither'
import * as TE from 'fp-ts/lib/TaskEither'
import inquirer from 'inquirer'
import inquirerFuzzyPath from 'inquirer-fuzzy-path'
import type { LegacyPromptConstructor } from 'node_modules/inquirer/dist/esm/types/ui/prompt.mjs'

import {
  getExtensionsPrompt,
  getFolderModePrompt,
  getMultipleFoldersPrompt,
  getReadonlyPrompt,
  getRecursivePrompt,
  getRootFolderPrompt,
  getSingleFolderPrompt,
} from './cli-prompts/prompts-helpers'
import type { TUserChoices } from './logic/types'
import { main } from './main'

const __filename = fileURLToPath(import.meta.url)

const registerInquirerPrompt = IOE.tryCatch(
  () =>
    inquirer.registerPrompt('fuzzypath', inquirerFuzzyPath as unknown as LegacyPromptConstructor),
  E.toError
)

const collectUserChoices = (): TE.TaskEither<Error, TUserChoices> => {
  const initialRootPathFolder = path
    .join(__filename, '../../../')
    .split('/')
    .slice(0, 3)
    .join('/')

  return pipe(
    TE.Do,
    TE.bind('rootFolder', () => getRootFolderPrompt(initialRootPathFolder)),
    TE.bind('folderMode', getFolderModePrompt),
    TE.bind('folderConfig', ({ folderMode, rootFolder }) =>
      folderMode === 'single' ? getSingleFolderPrompt(rootFolder) : getMultipleFoldersPrompt()),
    TE.bind('recursive', ({ folderMode }) =>
      folderMode === 'single' ? getRecursivePrompt() : TE.right(false)),
    TE.bind('fileExtensions', getExtensionsPrompt),
    TE.bind('readonly', getReadonlyPrompt),
    TE.map(
      ({ folderMode, folderConfig, rootFolder, recursive, fileExtensions, readonly }) =>
        ({
          folderMode,
          folderConfig,
          rootFolder,
          recursive,
          fileExtensions,
          readonly,
        }) satisfies TUserChoices
    )
  )
}

console.time('Program has been completed:')

const startCLI = pipe(
  TE.fromIOEither(registerInquirerPrompt),
  TE.flatMap(collectUserChoices),
  TE.flatMap(main),
  TE.match(
    (err) => {
      console.error(err)

      return process.exit(1)
    },
    () => console.timeEnd('Program has been completed:')
  )
)

// eslint-disable-next-line functional/no-expression-statements
void startCLI()
