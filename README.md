# Twin scanner CLI

<p align="center">
  <a href="#description">Description</a> •
  <a href="#technical-stack">Technical Stack</a> •
  <a href="#features">Features</a> •
  <a href="#dx-features">DX features</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#pre-requisites">Pre-requisites</a> •
  <a href="#quick-start">Quick start</a> •
  <a href="#miscellaneous">Miscellaneous</a> •
</p>

## Description
- Find duplicate files in multiple folder(s) scanning .txt or/and .torrent files and depending on the selected mode (readonly: true | false) get information about duplicated files /+ extract them into new folders.

## Technical Stack
- fp-ts
- inquirer
- inquirer-autocomplete-standalone
- inquirer-fuzzy-path
- zod

## Features

- Nested scanning in one/multi folders to get info about files
- Interactive CLI with step-by-step configuration and autocomplete for path selection
- Supporting only .txt, .torrent file scanning or both formats simultaneously to find duplicates between multiple folders
- Supporting readonly mode for casual listing info about duplicates without extraction them
- Supporting of removing duplicates not only between cross folders, but into the same folder as well f.e:
  1. For .torrent files: [ "cat.torrent", "cat (1).torrent", "cat (19).torrent"] => ["cat.torrent"]
  2. For .txt files: remove equal and duplicate (by analogy with torrent file names logic) lines from .txt file
- Supporting opportunity to define own custom mapper between torrent file name (`[rutracker.org].3021606.torrent`) and URL to torrent file locating in some txt file (`https://rutracker.org/forum/viewtopic.php?t=3021606`)

## DX features

- [semantic-release deploy](https://github.com/semantic-release/semantic-release)
- strict functional eslint config based on [eslint-plugin-functional](https://www.npmjs.com/package/eslint-plugin-functional)
- [dependency graph builder](https://github.com/sverweij/dependency-cruiser)
- [flamegraph profiling](https://github.com/davidmarkclements/0x)
- [git hooks](https://github.com/toplenboren/simple-git-hooks)
- typescript with [dev server](https://tsx.is/)
- [vite bundler](https://vite.dev/)
- [CI for quality analysis and auto deploy to NPM](.github/workflows)
- one command [upgrade dependencies](https://github.com/raineorshine/npm-check-updates)
- debug mode
- [This repo was built based on functional version of my custom template](https://github.com/Skippia/Universal-starter-templates)

## Documentation

### Example of manual configuration

- Setting VITE_APP_TORRENT_URL=`https://rutracker.org/forum/viewtopic.php` means that:
  - line in txt file `https://rutracker.org/forum/viewtopic.php?t=3021606` and
 torrent file `[rutracker.org].3021606.torrent` will be considered the same during deduplication process

- For overriding default mapper between torrent file and URL to torrent file, change `extractTorrentFileNameFromURL`, `convertTorrentFilenameToURL` functions and rebuild app.

### Demo

On the image is described file structure before and after applying CLI:

![Demo](https://github.com/Skippia/twin-scanner-cli/blob/master/docs/diagram.png?raw=true)

## Graph dependencies
- Top-level
  - ![SVG](https://github.com/Skippia/twin-scanner-cli/blob/master/docs/dependency-graph-top-level.svg?raw=true)
- All code
  - ![All code](https://github.com/Skippia/twin-scanner-cli/blob/master/docs/dependency-graph-nested.svg?raw=true)

## Pre-requisites

- Linux-based OS
- Node.js (checked on v20.15.1)
- pnpm

## Quick start

1. Clone actual version of app
```sh
git clone --depth 1 https://github.com/Skippia/twin-scanner-cli.git
```
2. Install dependencies
```sh
cd ./twin-scanner-cli && pnpm i
```
3. Set env (url) for mapping between torrent name and torrent URL in txt files
```sh
Rename .env.example -> .env and update variables
```
4. Build and run
```sh
npm run build && npm run start:prod
```
