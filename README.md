### Pre-requisites

- Linux or MacOS
- Node.js
- pnpm

### Installing

1. Clone actual version of app
```sh
git clone --depth 1 https://github.com/Skippia/twin-scanner-cli.git
```
2. Install dependencies
```sh
cd ./twin-scanner-cli && pnpm i
```
3. Set env (url) for mapping between torrent and txt files
```sh
Rename .env.example -> .env and update variables
```
4. Build and run
```sh
npm run build && npm run start:prod
```

### Demo

### Example of manual configuration

- Setting VITE_APP_TORRENT_URL=`https://rutracker.org/forum/viewtopic.php` means that:
  - line in txt file `https://rutracker.org/forum/viewtopic.php?t=3021606` and
 torrent file `[rutracker.org].3021606.torrent` will be considered the same

- For overriding default mapper change `extractTorrentFileNameFromURL`, `convertTorrentFilenameToURL` functions and rebuild app.
