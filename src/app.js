var anilistApi = require("./api/anilist");
const { getShow } = require("./api/mariadb");
const mariadb = require("./api/mariadb");
var db = require("./api/mariadb");
var nyaa = require("./api/nyaa");
var qbittorent = require("./api/qbittorent-nox");
//UserName in anilist
const { user } = require("./conf/anilistConf");

//Uploader of the torrent
const uploader = "Tsundere-Raws"
//Torrents are usually uploaded ~1.5h to ~2h after episode aired
const delay = 1.5
//where to save episodes
const savePath = "Downloads/torrent"

async function checkNewEpisodes() {
  var airing = await anilistApi.getCurrentAnime(user);
  let date = new Date();
  let mediaId, currentShow;

  //airing.Page.mediaList.length
  for (let index = 0; index < airing.Page.mediaList.length; index++) {

    mediaId = airing.Page.mediaList[index]["mediaId"];
    currentShow = await getShow(mediaId);

    const time = await anilistApi.getTimeTillNextEpisode(mediaId)
    if (time == undefined) continue;
    let nextEpisodeDate = getNexAiringEpisodeDate(time)

    //If show already exist we don't want to insert it again
    if (!currentShow[0]) {
      db.insertAnime(mediaId, time["Media"]["title"].romaji, nextEpisodeDate, false);
    }
    else {

      date = Date.parse(currentShow[0].nextAiringEpisode + " UTC") + (delay * 60 * 60 * 1000);
      if (date <= Date.now()) {
        //Starts download
        //TODO: check if episode not already downloaded in db just in case
        const magnet = await getMagnet(currentShow);
        await qbittorent.torrentsAddURLs([magnet], { savepath: savePath })
          .then((data) => mariadb.updateDownload(mediaId, nextEpisodeDate, true))
          .catch(err => console.log(err));
      }
    }
  }

}

async function getMagnet(currentShow) {

  let nyaaInfo = await nyaa.search(currentShow[0].title);
  //Checks if fileSize is a number
  if (Number.isNaN(Number.parseFloat(nyaaInfo[0].filesize.split(' ')[0])))
    return -1;
  if (parseFloat(nyaaInfo[0].filesize.split(' ')[0]) > 2 || !nyaaInfo[0].name.includes(uploader))
    return -1;

  return nyaaInfo[0].magnet
}

function getNexAiringEpisodeDate(nextEpisode) {

  date = new Date();
  date.setSeconds(
    date.getSeconds() + nextEpisode["AiringSchedule"]["timeUntilAiring"]
  );

  return date.toJSON().slice(0, 19).replace('T', ' ');
}

async function execute() {
  while (true) {
    checkNewEpisodes();
    await new Promise(resolve => setTimeout(resolve, 3600000));
  }
}

execute();
//Does not work on async function, might put a  sleep in checkNewEpisode
//var timer=setInterval(await checkNewEpisodes(),3600000);
