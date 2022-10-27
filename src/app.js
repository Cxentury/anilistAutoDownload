//Api
var anilistApi = require("./api/anilist");
const { getShow, getRetry, removeRetry } = require("./api/mariadb");
const mariadb = require("./api/mariadb");
var db = require("./api/mariadb");
var nyaa = require("./api/nyaa");
var qbittorent = require("./api/qbittorent-nox");

//Config
const { user } = require("./conf/anilistConf");
const { savePath } = require("./conf/systemConf");
const { uploader, delay } = require("./conf/nyaaSiConf");

async function checkNewEpisodes() {
  var airing = await anilistApi.getCurrentAnime(user);

  if (airing == undefined) {
    return;
  }

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
        const rt = await getRetry(mediaId);
        if (magnet == -1 && rt[0].retry > 0) {
          removeRetry(mediaId);
          return;
        }
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
  if ((parseFloat(nyaaInfo[0].filesize.split(' ')[0]) > 2 && !nyaaInfo[0].filesize.includes("MiB")) || !nyaaInfo[0].name.includes(uploader))
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
