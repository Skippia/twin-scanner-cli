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
3. Set env (url) for mapping between torrent name and torrent URL in txt files
```sh
Rename .env.example -> .env and update variables
```
4. Build and run
```sh
npm run build && npm run start:prod
```

### Demo

Let's assume we have such file structure:
- `torrent-storage`
  - `folder1`
    - [rutracker.org].t1(1).torrent
    - [rutracker.org].t1(2).torrent
    - [rutracker.org].t1.torrent
    - [rutracker.org].t2.torrent
    - [rutracker.org].t3.torrent
    - [rutracker.org].t4.torrent
    - `list-1.txt`
      - https://rutracker.org/forum/viewtopic.php?t=1
      - https://rutracker.org/forum/viewtopic.php?t=2
      - https://rutracker.org/forum/viewtopic.php?t=3
      - https://rutracker.org/forum/viewtopic.php?t=99
      - https://rutracker.org/forum/viewtopic.php?t=1
  - `folder2`
    - [rutracker.org].t1.torrent
    - [rutracker.org].t2.torrent
    - [rutracker.org].t14.torrent
    - [rutracker.org].t15.torrent
    - [rutracker.org].t15(2).torrent
    - [rutracker.org].t200.torrent
    - `list-2.txt`
      - https://rutracker.org/forum/viewtopic.php?t=1
      - https://rutracker.org/forum/viewtopic.php?t=14
      - https://rutracker.org/forum/viewtopic.php?t=16
      - https://rutracker.org/forum/viewtopic.php?t=17
      - https://rutracker.org/forum/viewtopic.php?t=17

  - `folder3`
    - [rutracker.org].t1.torrent
    - [rutracker.org].t2.torrent
    - [rutracker.org].t14.torrent
    - [rutracker.org].t15.torrent
    - [rutracker.org].t300.torrent
    - [rutracker.org].t300(1).torrent
    - `list-3.txt`
      - https://rutracker.org/forum/viewtopic.php?t=1
      - https://rutracker.org/forum/viewtopic.php?t=14
      - https://rutracker.org/forum/viewtopic.php?t=16
      - https://rutracker.org/forum/viewtopic.php?t=25
      - https://rutracker.org/forum/viewtopic.php?t=26
      - https://rutracker.org/forum/viewtopic.php?t=1

After applying CLI this file structure will be converted into:
- `duplicates-extrated`
  - `folder1_folder1--list-1_folder2_folder2--list-2_folder3_folder3--list-3`
    - [rutracker.org].t1.torrent
  - `folder2_folder2--list-2_folder3_folder3--list-3`
    - [rutracker.org].t14.torrent
  - `folder1_folder1--list-1_folder2_folder3`
    - [rutracker.org].t2.torrent
  - `folder2--list-2_folder3--list-3`
    - `common.txt`
      - https://rutracker.org/forum/viewtopic.php?t=16
  - `folder1_folder1--list-1`
    - [rutracker.org].t3.torrent
  - `folder2_folder3`
    - [rutracker.org].t15.torrent
- `torrent-storage`
  - `folder1`
    - [rutracker.org].t4.torrent
    - `list-1.txt`
      - https://rutracker.org/forum/viewtopic.php?t=99
  - `folder2`
    - [rutracker.org].t200.torrent
    - `list-2.txt`
      - https://rutracker.org/forum/viewtopic.php?t=17
  - `folder3`
    - [rutracker.org].t300.torrent
    - `list-3.txt`
      - https://rutracker.org/forum/viewtopic.php?t=25
      - https://rutracker.org/forum/viewtopic.php?t=26

### Example of manual configuration

- Setting VITE_APP_TORRENT_URL=`https://rutracker.org/forum/viewtopic.php` means that:
  - line in txt file `https://rutracker.org/forum/viewtopic.php?t=3021606` and
 torrent file `[rutracker.org].3021606.torrent` will be considered the same

- For overriding default mapper change `extractTorrentFileNameFromURL`, `convertTorrentFilenameToURL` functions and rebuild app.
