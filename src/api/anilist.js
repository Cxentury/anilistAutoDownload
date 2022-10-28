var { graphql, buildSchema } = require("graphql");
const fetch = require('cross-fetch');

function getQuery(status) {
  switch (status) {
    case "airing":
      return `query ($userName: String) { # Define which variables will be used in the query (id)
                        Page {
                            mediaList(userName: $userName status:CURRENT type:ANIME) {
                            status
                            mediaId
                            }
                        }
                    }`;
    case "nextEpisode":
      /*status: RELEASING has been remove from parameters because of the following reason
      an anime is not considered RELEASING if he does not have at least one episode aired
      so the first episode of a show won't be downloaded*/
      return `query ($mediaId: Int) {
                Media(id:$mediaId,type: ANIME){
                  title {
                    romaji
                  }
                }
                AiringSchedule(mediaId: $mediaId,notYetAired:true){
                    timeUntilAiring
                  }
              }`;
    default:
      break;
  }
}

// Define our query variables and values that will be used in the query request
function getVariables(status, variable) {
  switch (status) {
    case "airing":
      return { userName: variable };
    case "nextEpisode":
      return { mediaId: variable };
    default:
      break;
  }
}

// Define the config we'll need for our Api request
var url = "https://graphql.anilist.co";
function getOption(status, variable) {
  const query = getQuery(status);
  const variables = getVariables(status, variable);
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: query,
      variables: variables,
    }),
  };
}

// Make the HTTP Api request
module.exports = {
  getCurrentAnime: async function (user) {
    return fetch(url, getOption("airing", user))
      .then(handleResponse)
      .then(handleData)
      .catch(handleError);
  },
  getTimeTillNextEpisode: async function (animeId) {
    return fetch(url, getOption("nextEpisode", animeId))
      .then(handleResponse)
      .then(handleData)
      .catch(handleError);
  },
};

function handleResponse(response) {
  return response.json().then(function (json) {
    return response.ok ? json : Promise.reject(json);
  });
}

function handleData(data) {
  return data.data;
}

function handleError(error) {
  //This is gonna print if the anime in "currently watching is not currently airing"
  //console.log(error);
}
