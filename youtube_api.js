const youtube_node = require('youtube-node');

const youtube = new youtube_node();
youtube.setKey('AIzaSyCaIz0aDA89q0W-oDhOb3s_h3_jRe_b8cQ');
youtube.addParam('type', 'video');

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
                });
            });
            callback(result_list);
        }
    });
}

// searchYoutube('Olivia Hye', (data)=>{
//     console.log(data);
// });

module.exports = {
    search: searchYoutube
}