const YouTube = require('youtube-node');
const open = require('open');
const googleCloud = require('@google-cloud/speech');

async function searchYoutube(data) {
    const { YoutubeApiKey: key } = process.env;
  
  
    const youtube = new YouTube();
  
    youtube.setKey(key);
    youtube.addParam('type', 'video');
  
    youtube.search(`${data.transcript}`, 5, async(err, result) => {
      if(err) {
        console.log(err);
      } else {
        console.log(JSON.stringify(result, null, 5));
  
        //let { videoId } = result.items[0].id;
        //let url = "https://www.youtube.com/watch?v=" + videoId;
  
        //await open(url, {app:'chrome'});
      }
    })
  }
  

searchYoutube('Olivia Hye');