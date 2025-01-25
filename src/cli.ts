import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import inquirer from 'inquirer'
import inquirerFuzzyPath from 'inquirer-fuzzy-path'

import { validateFolderPath } from './files/effect'
import { main } from './main'

const __filename = fileURLToPath(import.meta.url)

// @ts-expect-error ...
inquirer.registerPrompt('fuzzypath', inquirerFuzzyPath)

export type TUserChoices = {
  folderMode: 'single' | 'multiple'
  folderPath?: string
  folderPaths?: string[]
  fileExtensions: string[]
  rootFolder: string
  recursive: boolean
  readonly: boolean
}

async function startCLI() {
  const options = {
    recursive: false,
    // get current directory as default folder
  } as TUserChoices

  const rootPathFolder = path.join(__filename, '../../../')

  // @ts-expect-error ...
  const rootFolderAnswer = await inquirer.prompt([
    {
      type: 'fuzzypath',
      name: 'rootFolder',
      excludePath: (nodePath: string) => nodePath.startsWith('node_modules'),
      message: `Select a root folder, current: ${rootPathFolder}' \n`,
      itemType: 'directory',
      rootPath: rootPathFolder,
      suggestOnly: false,
      depthLimit: 1,
      validate: ({ short }: { short: string }) => validateFolderPath(short),
    },
  ])

  options.rootFolder = rootFolderAnswer.rootFolder

  const folderModeAnswer = (await inquirer.prompt([
    {
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
    },
  ])) as TUserChoices

  options.folderMode = folderModeAnswer.folderMode

  if (options.folderMode === 'single') {
    // @ts-expect-error ...
    const singleFolderAnswer = await inquirer.prompt([
      {
        type: 'fuzzypath',
        name: 'folderPath',
        excludePath: (nodePath: string) => nodePath.startsWith('node_modules'),
        message: 'Select a folder:',
        itemType: 'directory',
        rootPath: options.rootFolder,
        suggestOnly: false,
        depthLimit: 1,
        validate: ({ short }: { short: string }) => validateFolderPath(short),
      },
    ])
    options.folderPath = singleFolderAnswer.folderPath
  }
  else {
    const multipleFoldersAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'folderPaths',
        message: 'Input absolute paths to folders (separated by comma):',
        validate: (input) => {
          const paths = input.split(',').map(p => p.trim())
          for (const folderPath of paths) {
            const validationResult = validateFolderPath(folderPath)

            if (typeof validationResult === 'string') return `Invalid path: ${folderPath}; ${validationResult}`
          }
          return true
        },
        filter: (input: string) => input.split(',').map(p => p.trim()),
      },
    ])
    options.folderPaths = multipleFoldersAnswer.folderPaths
  }

  if (options.folderMode === 'single') {
    const recursiveAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'recursive',
        message: 'Do you want to recursively find duplicates in all subfolders?',
        choices: [
          {
            name: 'Yes',
            value: true,
          },
          {
            name: 'No',
            value: false,
          },
        ],
      },
    ])
    options.recursive = recursiveAnswer.recursive
  }

  const extensionsAnswer = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'fileExtensions',
      message: 'Define file extensions where to find duplicates:',
      choices: [
        {
          name: '.txt',
          value: 'txt',
        },
        {
          name: '.torrent',
          value: 'torrent',
        },
      ],
    },
  ])

  const readonlyAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'readonly',
      message: 'Do you want to extract duplicates into separate folders?',
      choices: [
        {
          name: 'No, just get info about duplicates (readonly mode)',
          value: true,
        },
        {
          name: 'Yes',
          value: false,
        },
      ],
    },
  ])

  options.readonly = readonlyAnswer.readonly
  options.fileExtensions = extensionsAnswer.fileExtensions

  await main(options)
}

// Run the CLI
startCLI().catch((err) => {
  console.error(JSON.stringify(err, null, 2))
  process.exit(1)
})
