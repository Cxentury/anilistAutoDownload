# anilistAutoDownload

This is a project made for myself so the Readme might be incomplete, I just wrote it in case someone was interested (you can inform me if there is any missing information).

Auto downloads anime you're currently watching on Anilist using torrents from nyaa.si.  
made with [AnilistApi](https://anilist.gitbook.io/anilist-apiv2-docs/), [Nyaapi](https://github.com/Kylart/Nyaapi) and [Qbittorent-nox](https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1))

***

## Prerequisite

[Nodejs](https://nodejs.org/en/)  
[MariaDb](https://mariadb.org/)  
[qbittorent-nox](https://github.com/qbittorrent/qBittorrent/wiki)

***

## Installation

Download the project and run `npm i` in the root folder to install dependencies.

In order for this to work you'll also need a database to store your currently watching anime and other informations (in this case Mariadb).

```sql
--In mysql prompt
create database anilistAutoDl
create table airing(mediaId int, title varchar(100),nextAiringEpisode DateTime, downloaded bool);
```

you'll also need to grant permission to the user using the database  

```sql
-- You technically don't need all privileges on the database, just update, insert and select
Grant all privileges on anilistAutoDl to 'user'@localhost IDENTIFIED BY 'password'
```
Rename the folder *confGit* to *conf* and modify the information in the .js file according to your settings (they are pretty explicit).  
There are a lot of config files with few information in them but it's to keep things clear and easily modifiable.

### Run


`node app.js`  

Run app.js using Nodejs (I don't know if a specific version is required, but it should work on any version present in an official repository).  

You also need to run Qbittorent-nox (check if the user running qbittorent has the permission to write in the savePath)  
On headless server you might want to use something like [screen](https://linux.die.net/man/1/screen) to keep the program running in the background.  
There is a port parameter in 'qbittorent-noxConf' that you need to change if your qbittorent is not running on port 8080.
