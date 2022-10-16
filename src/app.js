var anilistApi = require("./api/anilist");

async function checkNewEpisodes() {
  var airing = await anilistApi.getCurrentAnime();
  let date = new Date();
  for (let index = 0; index < airing.Page.mediaList.length; index++) {
    const time = await anilistApi.getTimeTillNextEpisode(
      airing.Page.mediaList[index]["mediaId"]
    );
    if (time) {
      date = new Date();
      date.setSeconds(
        date.getSeconds() + time["AiringSchedule"]["timeUntilAiring"]
      );
      console.log(date);
    }
  }
}

checkNewEpisodes();
