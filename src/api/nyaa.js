const { si } = require('nyaapi')
const { lang, uploader } = require("../conf/nyaaSiConf");

module.exports = {
    search: async function (name,episode) {
        return await si.search(`${uploader} ${name} ${episode} ${lang}`, 1, {})
            .then(data => { return data })
            .catch((err) => console.log(err))
    }
}