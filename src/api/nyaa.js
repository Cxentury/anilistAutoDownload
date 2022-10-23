const { si, pantsu } = require('nyaapi')
const user = "Tsundere-Raws"
const lang="vostfr"

module.exports = {
    search: async function (args) {
        return await si.search(`${user} ${args} ${lang}`, 1, {})
            .then(data => { return data })
            .catch((err) => console.log(err))
    }
}