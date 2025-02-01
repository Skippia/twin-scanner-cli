import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import type PromptModule from 'inquirer'
import inquirer from 'inquirer'
import inquirerFuzzyPath from 'inquirer-fuzzy-path'
import type { LegacyPromptConstructor } from 'node_modules/inquirer/dist/esm/ui/prompt'

import { main } from './main'
import { PROMPTS_RECORD } from './prompts'

const __filename = fileURLToPath(import.meta.url)

// eslint-disable-next-line functional/prefer-immutable-types
const registerInquirerPrompt = (inquirerInstance: Readonly<typeof PromptModule>): Readonly<typeof PromptModule> => {
  inquirerInstance.registerPrompt('fuzzypath', inquirerFuzzyPath as unknown as LegacyPromptConstructor)
  return inquirerInstance
}

export type TUserChoices = {
  readonly folderMode: 'single' | 'multiple'
  readonly folderPath?: string
  readonly folderPaths?: ReadonlyArray<string>
  readonly fileExtensions: string[]
  readonly rootFolder: string
  readonly recursive: boolean
  readonly readonly: boolean
}

const collectUserChoices = async (): Promise<TUserChoices> => {
  const rootPathFolder = path.join(__filename, '../../../')

  // eslint-disable-next-line functional/no-expression-statements
  registerInquirerPrompt(inquirer)

  const { rootFolder } = await inquirer.prompt([PROMPTS_RECORD.getRootFolderPrompt(rootPathFolder)])
  const { folderMode } = await inquirer.prompt([PROMPTS_RECORD.getFolderModePrompt()])

  const folderConfig
    = folderMode === 'single'
      ? { folderPath: (await inquirer.prompt([PROMPTS_RECORD.getSingleFolderPrompt(rootFolder as string)])).folderPath }
      : { folderPaths: (await inquirer.prompt([PROMPTS_RECORD.getMultipleFoldersPrompt()])).folderPaths }

  const recursive
    = folderMode === 'single' ? (await inquirer.prompt([PROMPTS_RECORD.getRecursivePrompt()])).recursive : false

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

const handleError = (error: unknown): never => {
  console.error(JSON.stringify(error, null, 2))
  return process.exit(1)
}

const startCLI = async (): Promise<void> => {
  const userChoices = await collectUserChoices()
  return await main(userChoices)
}

// Run the CLI
startCLI().catch(handleError)
