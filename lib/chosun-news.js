const http = require('http');


const default_options = {
    "method": "GET",
    "hostname": "news.chosun.com",
    "port": 80,
    "path": "/ranking/rss/www/politics/list.xml",
    "headers": {
        "cache-control": "no-cache"
    }
}

class CNS_Parser {
    async parse(path, callback) {
        let opts = default_options;
        opts.path = path;
        let req = http.request(opts, (res) => {let chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            res.on("end", function() {
                let data = Buffer.concat(chunks).toString();
                let lines = [];
                for (let i = 0; i < 30; ++i)
                {
                    let begin = data.indexOf('<item>');
                    data = data.substring(begin);
                    let end = data.indexOf('</item>');
                    let item = data.substring(0, end);
                    {
                        let begin = item.indexOf('<title>');
                        let line = item.substring(begin + '<title>'.length + 9);
                        let end = line.indexOf('</title>');
                        line = line.substring(0, end - 3);
                        lines.push(line);
                    }
                    data = data.substring(end);
                }
                callback(lines);
            });
        });
        await req.end();
    }
}

const parser = new CNS_Parser();
module.exports = {
    parse: (...args) => parser.parse(...args)
}

  

//const abc = new CNS_Parser();
//abc.parse(options, (x) => {});
