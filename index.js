require('dotenv').config();
const recorder = require('node-record-lpcm16');
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

const request = {
  config: {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'ko-KR',
  },
  interimResults: false, // If you want interim results, set this to true
};

// Create a recognize stream
const recognizeStream = client
  .streamingRecognize(request)
  .on('error', console.error)
  .on('data', data => {
    let searchTitle = data.results[0].alternatives[0];

      process.stdout.write(
        data.results[0] && data.results[0].alternatives[0]
          ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
          : `\n\nReached transcription time limit, press Ctrl+C\n`
      )

    searchYoutube(searchTitle);
    }
  );

// Start recording and send the microphone input to the Speech API
recorder
  .record({
    sampleRateHertz: 16000,
    threshold: 0,
    device: null,
    verbose: false,
    recordProgram: 'rec',
    silence: '10.0',
  })
  .stream()
  .on('error', console.error)
  .pipe(recognizeStream);

console.log('Listening, press Ctrl+C to stop.');

async function searchYoutube(data) {
  const YouTube = require('youtube-node');
  const open = require('open');
  const { YoutubeApiKey: key } = process.env;


  const youtube = new YouTube();
  
  youtube.setKey(key);
  youtube.addParam('type', 'video');

  youtube.search(`${data.transcript}`, 5, async(err, result) => {
    if(err) {
      console.log(err);
    } else {
      console.log(JSON.stringify(result, null, 5));

      let { videoId } = result.items[0].id;
      let url = "https://www.youtube.com/watch?v=" + videoId;

      await open(url, {app:'chrome'});
    }
  })
}