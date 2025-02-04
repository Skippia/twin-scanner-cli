import type inquirer from 'inquirer'

import { validateFolderPath } from '@/files/system-operations'

type FunctionReturningTPromptEl = (() => TPromptEl) | ((val: string) => TPromptEl)

export type TPromptEl = Readonly<Parameters<(typeof inquirer)['prompt']>[0]>

export const PROMPTS_RECORD = {
  getRootFolderPrompt: (rootPathFolder: string): TPromptEl => ({
    // @ts-expect-error ...
    type: 'fuzzypath',
    name: 'rootFolder',
    excludePath: (nodePath: string) => nodePath.startsWith('node_modules'),
    message: `Select a root folder, current: ${rootPathFolder}' \n`,
    itemType: 'directory',
    rootPath: rootPathFolder,
    suggestOnly: false,
    depthLimit: 1,
    // @ts-expect-error ...
    validate: ({ short }: { readonly short: string }) => validateFolderPath(short),
  }),
  getFolderModePrompt: (): TPromptEl => ({
    type: 'list',
    name: 'folderMode',
    message: 'How do you want to define the folder with duplicates?',
    choices: [
      {
        name: 'Find duplicates in root folder (define one folder)',
        value: 'single',
      },
      {
        name: 'Find duplicates in different folders (define multiple folders)',
        value: 'multiple',
      },
    ],
  }),
  getSingleFolderPrompt: (rootFolder: string): TPromptEl => ({
    // @ts-expect-error ...
    type: 'fuzzypath',
    name: 'folderPath',
    excludePath: (nodePath: string) => nodePath.startsWith('node_modules'),
    message: 'Select a folder:',
    itemType: 'directory',
    rootPath: rootFolder,
    suggestOnly: false,
    depthLimit: 1,
    // @ts-expect-error ...
    validate: ({ short }: { readonly short: string }) => validateFolderPath(short)(),
  }),
  getMultipleFoldersPrompt: (): TPromptEl => ({
    type: 'input',
    name: 'folderPaths',
    message: 'Input absolute paths to folders (separated by comma):',
    validate: (input: string): boolean | string => {
      const paths = input.split(',').map(p => p.trim())
      const invalidPath = paths.find(folderPath => typeof validateFolderPath(folderPath) === 'string')
      return invalidPath ? `Invalid path: ${invalidPath}; ${validateFolderPath(invalidPath)()}` : true
    },
    filter: (input: string) => input.split(',').map(p => p.trim()),
  }),
  getRecursivePrompt: (): TPromptEl => ({
    type: 'list',
    name: 'recursive',
    message: 'Do you want to recursively find duplicates in all subfolders?',
    choices: [
      { name: 'Yes', value: true },
      { name: 'No', value: false },
    ],
  }),
  getExtensionsPrompt: (): TPromptEl => ({
    type: 'checkbox',
    name: 'fileExtensions',
    message: 'Define file extensions where to find duplicates:',
    choices: [
      { name: '.txt', value: 'txt' },
      { name: '.torrent', value: 'torrent' },
    ],
  }),
  getReadonlyPrompt: (): TPromptEl => ({
    type: 'list',
    name: 'readonly',
    message: 'Do you want to extract duplicates into separate folders?',
    choices: [
      { name: 'No, just get info about duplicates (readonly mode)', value: true },
      { name: 'Yes', value: false },
    ],
  }),
} as const satisfies Readonly<Record<string, FunctionReturningTPromptEl>>
