var FormData = require('form-data');
const axios = require('axios');
const { username, password, port } = require('../conf/qbittorent-noxConf');

let cookie;
const apiBase = `http://localhost:${port}/api/v2`

async function updateCookie() {
    await axios.post(
        `${apiBase}/auth/login`,
        new URLSearchParams({
            'username': username,
            'password': password
        }),
        {
            headers: {
                'Referer': `http://localhost:${port}`
            }
        }
    )
        .then((data) => cookie = data.headers["set-cookie"][0].split(";")[0]);
}


module.exports = {
    torrentsAddURLs: async function torrentsAddURLs(urls, options) {
        await updateCookie();
        const form = new FormData();

        form.append('urls', urls.join('\n'));

        Object.keys(options).forEach((key) => {
            form.append(key, `${options[key]}`);
        });

        const headers = form.getHeaders({
            Cookie: cookie,
            'Content-Length': form.getLengthSync(),
        });

        return axios
            .post(`${apiBase}/torrents/add`, form, {
                headers,
            })
    }
}