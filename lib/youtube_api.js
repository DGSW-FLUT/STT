const youtube_node = require('youtube-node');
const API_KEY = '';
const youtube = new youtube_node();
youtube.setKey(API_KEY);
youtube.addParam('type', 'video');

const https = require('https');

function getVideoInfo(id, callback) {
    const opts = {
        "method": "GET",
        "hostname": "www.googleapis.com",
        "port": 443,
        "path": '/youtube/v3/videos?id=' + id + '&part=contentDetails&key=' + API_KEY,
        "headers": {
            "cache-control": "no-cache"
        }
    }
    let req = https.request(opts, (res) => {
        let chunks = [];
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        res.on("end", function() {
            let data = Buffer.concat(chunks).toString();
            callback(JSON.parse(data));
        });
    });
    req.end();
}


function searchYoutube(data, callback) {
    youtube.search(data, 6, (err, result) => {
        if(err) {
            console.log(err);
        } else {
            let tube_list = result;
            let result_list = [];
            
            tube_list.items.forEach(e => {
                result_list.push({
                    'title': e.snippet.title,
                    'videoId': e.id.videoId,
                    'desc': e.snippet.description
                });
            });
            callback(result_list);
        }
    });
}

//searchYoutube('Olivia Hye', (data)=>{
    //console.log(data);
//});

module.exports = {
    search: searchYoutube,
    info: getVideoInfo
}