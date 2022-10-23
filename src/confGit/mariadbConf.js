const mariadb = require('mariadb');

module.exports = {
    pool: mariadb.createPool({
        host: 'localhost',
        user: 'userOfDataBase',
        password: 'password',
        database: 'anilistAutoDl',
        connectionLimit: 5
    })
}