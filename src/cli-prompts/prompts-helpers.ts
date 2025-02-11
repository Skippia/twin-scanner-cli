import { pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import inquirer from 'inquirer'

import type { ExtractorFileExtensions } from '../logic/types'
import { fromPromise } from '../shared/helpers'

import { PROMPTS_RECORD } from './prompts-map'

export const getRootFolderPrompt = (rootPathFolder: string): TE.TaskEither<Error, string> =>
  pipe(
    fromPromise(inquirer.prompt([PROMPTS_RECORD.getRootFolderPrompt(rootPathFolder)])),
    TE.map(({ rootFolder }) => rootFolder)
  )

export const getFolderModePrompt = (): TE.TaskEither<Error, 'single' | 'multiple'> =>
  pipe(
    fromPromise(inquirer.prompt([PROMPTS_RECORD.getFolderModePrompt()])),
    TE.map(({ folderMode }) => folderMode)
  )

export const getSingleFolderPrompt = (rootFolder: string): TE.TaskEither<Error, string[]> =>
  pipe(
    fromPromise(inquirer.prompt([PROMPTS_RECORD.getSingleFolderPrompt(rootFolder)])),
    TE.map(({ folderPath }) => [folderPath])
  )

export const getMultipleFoldersPrompt = (): TE.TaskEither<Error, string[]> =>
  pipe(
    fromPromise(inquirer.prompt([PROMPTS_RECORD.getMultipleFoldersPrompt()])),
    TE.map(({ folderPaths }) => folderPaths)
  )

export const getRecursivePrompt = (): TE.TaskEither<Error, boolean> =>
  pipe(
    fromPromise(inquirer.prompt([PROMPTS_RECORD.getRecursivePrompt()])),
    TE.map(({ recursive }) => recursive)
  )

export const getExtensionsPrompt = (): TE.TaskEither<Error, ExtractorFileExtensions[]> =>
  pipe(
    fromPromise(inquirer.prompt([PROMPTS_RECORD.getExtensionsPrompt()])),
    TE.map(({ fileExtensions }) => fileExtensions)
  )

export const getReadonlyPrompt = (): TE.TaskEither<Error, boolean> =>
  pipe(
    fromPromise(inquirer.prompt([PROMPTS_RECORD.getReadonlyPrompt()])),
    TE.map(({ readonly }) => readonly)
  )
