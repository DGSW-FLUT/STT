const https = require('https');


const default_options = {
    "method": "GET",
    "hostname": "datalab.naver.com",
    "port": 443,
    "path": "/keyword/realtimeList.naver?where=main",
    "headers": {
        "Cache-Control": "no-cache",
        "User-Agent": "PostmanRuntime/7.21.0",
    }
}

class Naver_Parser {
    async parse(callback) {
        let req = https.request(default_options, (res) => {let chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            res.on("end", function() {
                const common = '<span class="item_title">';
                let data = Buffer.concat(chunks).toString();
                let list = [];
                for (let i = 0; i < 20; ++i)
                {
                    const target = '<span class="item_num">' + (i + 1) + '</span>';
                    let s = data.substring(data.indexOf(target) + target.length);
                    s = s.substring(0, s.indexOf('</span>'));
                    s = s.substring(s.indexOf(common) + common.length);
                    list.push(s);
                }
                callback(list);
            });
        });
        await req.end();
    }
}

const parser = new Naver_Parser();
module.exports = {
    parse: (...args) => parser.parse(...args)
}