var {pool, retry} = require("../conf/mariadbConf.js");
let connection;

module.exports = {
    connection: connection,
    //I will change those .then with func(err,result)
    selectAll: async function () {
        connection = await getConnection();
        connection.query("SELECT * from airing")
            .then(result => result.forEach(e => console.log(e)))
            .then(connection.close())
            .catch(err => console.log(err));
    },
    insertAnime: async function (mediaId, title, nextAiringEpisode, downloaded) {
        connection = await getConnection();
        connection.query(`insert into airing values(${mediaId},'${title}','${nextAiringEpisode}',${downloaded},${retry})`)
            .then(console.log("added anime " + mediaId))
            .then(connection.close())
            .catch(err => console.log(err));
    },
    getShow: async function (mediaId) {
        connection = await getConnection();
        return connection.query(`SELECT * from airing where mediaId=${mediaId}`, function (err, result) {
            if (err) {
                console.log(err);
            }
            connection.close();
        });
    },
    updateDownload: async function (mediaId, nextAiringEpisode, status) {
        connection = await getConnection();
        connection.query(`update airing set downloaded=${status},nextAiringEpisode='${nextAiringEpisode}',retry=${retry} where mediaId=${mediaId}`, function (err, result) {
            if (err)
                throw err;

            connection.close();
        });
    },
    getRetry: async function (mediaId) {
        connection = await getConnection();
        return connection.query(`select retry from airing where mediaId=${mediaId}`, function (err, result) {
            if (err)
                throw err;
            connection.close();
        });
    },
    removeRetry: async function (mediaId) {
        connection = await getConnection();
        connection.query(`update airing set retry=retry-1 where mediaId=${mediaId}`, function (err, result) {
            if (err)
                throw err;

            connection.close();
        });
    }
};

async function getConnection() {
    if (connection) {
        return connection; //Might cause error if connection is not closed so return to it in case mariadb does not work
    }

    return await pool.getConnection(function onConnect(err, connection) {
        if (err) {
            console.log('error when connecting to db:', err);
        }
        return connection;
    });
}