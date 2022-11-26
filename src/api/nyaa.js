const { si, pantsu } = require('nyaapi')
const user = "Tsundere raws"
const lang="vostfr"

module.exports = {
    search: async function (name,episode) {
        return await si.search(`${user} ${name} ${episode} ${lang}`, 1, {})
            .then(data => { return data })
            .catch((err) => console.log(err))
    }
}