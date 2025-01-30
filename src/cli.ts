/* eslint-disable functional/no-expression-statements */
/* eslint-disable functional/functional-parameters */

import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import type PromptModule from 'inquirer'
import inquirer from 'inquirer'
import inquirerFuzzyPath from 'inquirer-fuzzy-path'
import type { LegacyPromptConstructor } from 'node_modules/inquirer/dist/esm/ui/prompt'

import { main } from './main'
import { PROMPTS_RECORD } from './prompts'

const createFilename = () => fileURLToPath(import.meta.url)

const registerInquirerPrompt = (inquirerInstance: Readonly<typeof PromptModule>) => {
  inquirerInstance.registerPrompt('fuzzypath', inquirerFuzzyPath as unknown as LegacyPromptConstructor)
  return inquirerInstance
}

export type TUserChoices = {
  readonly folderMode: 'single' | 'multiple'
  readonly folderPath?: string
  readonly folderPaths?: readonly string[]
  readonly fileExtensions: readonly string[]
  readonly rootFolder: string
  readonly recursive: boolean
  readonly readonly: boolean
}

const collectUserChoices = async (): Promise<TUserChoices> => {
  const __filename = createFilename()
  const rootPathFolder = path.join(__filename, '../../../')

  registerInquirerPrompt(inquirer)

  const { rootFolder } = await inquirer.prompt([PROMPTS_RECORD.getRootFolderPrompt(rootPathFolder)])
  const { folderMode } = await inquirer.prompt([PROMPTS_RECORD.getFolderModePrompt()])

  const folderConfig = folderMode === 'single'
    ? { folderPath: (await inquirer.prompt([PROMPTS_RECORD.getSingleFolderPrompt(rootFolder as string)])).folderPath }
    : { folderPaths: (await inquirer.prompt([PROMPTS_RECORD.getMultipleFoldersPrompt()])).folderPaths }

  const recursive = folderMode === 'single'
    ? (await inquirer.prompt([PROMPTS_RECORD.getRecursivePrompt()])).recursive
    : false

  const { fileExtensions } = await inquirer.prompt([PROMPTS_RECORD.getExtensionsPrompt()])
  const { readonly } = await inquirer.prompt([PROMPTS_RECORD.getReadonlyPrompt()])

  return {
    folderMode,
    ...folderConfig,
    rootFolder,
    recursive,
    fileExtensions,
    readonly,
  }
}

const handleError = (error: unknown) => {
  console.error(JSON.stringify(error, null, 2))
  return process.exit(1)
}

const startCLI = async () => {
  const userChoices = await collectUserChoices()
  await main(userChoices)
}

// Run the CLI
startCLI().catch(handleError)
