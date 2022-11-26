// TODO : find a solution to download last episode from show

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
    console.error("Error getting user's anime");
    return;
  }
  
  console.log("New check for episodes at ", new Date(Date.now()));
  let date = new Date();
  let mediaId, currentShow;
  
  for (let index = 5; index < airing.Page.mediaList.length; index++) {
    
    mediaId = airing.Page.mediaList[index]["mediaId"];
    currentShow = await getShow(mediaId);
    const airingSchedule = await anilistApi.getTimeTillNextEpisode(mediaId)
    //AnilistApi will block you if you send too much request too fast
    await new Promise(resolve => setTimeout(resolve, 10000));

    if (airingSchedule == undefined) {
      console.log("time undefined for", mediaId);
      continue;
    }

    let nextEpisodeDate = getNexAiringEpisodeDate(airingSchedule)
    let currentEpisode = getEpisode(airingSchedule);

    //If show already exists we don't want to insert it again
    if (!currentShow[0]) {
      db.insertAnime(mediaId, airingSchedule["Media"]["title"].romaji, nextEpisodeDate, false);
    }

    date = Date.parse(currentShow[0].nextAiringEpisode) + (delay * 60 * 60 * 1000);
    console.log("Checking date", currentShow[0].title, new Date(date), new Date(Date.now()), date <= Date.now());

    if (date <= Date.now()) {
      console.log(currentShow[0].title, " -> To download");
      //Starts download
      const magnet = await getMagnet(currentShow, currentEpisode);
      const rt = await getRetry(mediaId);

      if (magnet == -1)
        console.log("Could not download", currentShow[0].title);
      if (magnet == -1 && rt[0].retry > 0) {
        removeRetry(mediaId);
        continue;
      }
      await qbittorent.torrentsAddURLs([magnet], { savepath: savePath })
        .then((data) => {
          if (data.data.localeCompare("Ok.") == 0) {
            mariadb.updateDownload(mediaId, nextEpisodeDate, true)
          }
          else {
            console.log("data fails on torrent upload\n");
            removeRetry(mediaId);
          }
        })
        .catch(err => console.log(err));
    }
  }

}

async function getMagnet(currentShow, episode) {

  let nyaaInfo = await nyaa.search(currentShow[0].title, episode);
  if (nyaaInfo[0] == undefined)
    return -1;
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

function getEpisode(airingSchedule) {
  return (parseInt(airingSchedule["AiringSchedule"]["episode"]) - 1) || ""
}

async function execute() {
  while (true) {
    checkNewEpisodes();
    await new Promise(resolve => setTimeout(resolve, 3600000));
  }
}

execute();
