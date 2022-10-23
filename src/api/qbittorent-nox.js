var FormData = require('form-data');
const axios = require('axios');
const { username, password } = require('../conf/qbittorent-noxConf');

let cookie;
const apiBase = "http://localhost:9090/api/v2"

async function updateCookie() {
    await axios.post(
        'http://localhost:9090/api/v2/auth/login',
        new URLSearchParams({
            'username': username,
            'password': password
        }),
        {
            headers: {
                'Referer': 'http://localhost:9090'
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