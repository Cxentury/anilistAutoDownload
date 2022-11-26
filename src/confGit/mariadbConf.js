const mariadb = require('mariadb');
//Change those parameters according to your setup
module.exports = {
    pool: mariadb.createPool({
        host: 'localhost',
        user: 'userOfDataBase',
        password: 'password',
        database: 'anilistAutoDl',
        connectionLimit: 5
    }),
    //Number of retries allowed before giving up on downloading an episode
    retry: 3
}