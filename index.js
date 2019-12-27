//require('dotenv').config();
const recorder = require('node-record-lpcm16');
//Change args from "node-record-lpcm16/recordes\sox.js"
/*
let args = [
  '--no-show-progress', // show no progress
  '-t', options.audioType,
  '-d',
  '--rate', options.sampleRate, // sample rate
  '--channels', options.channels, // channels
  '--encoding', 'signed-integer', // sample encoding
  '--bits', '16', // precision (bits)
  '--type', 'raw', // audio type
  '-' // pipe
]
*/
const speech = require('@google-cloud/speech');
//1. Install Google Cloud SDK
//2. ADD Evrionment PATH GOOGLE_APPLICATION_CREDENTIALS
/*
https://cloud.google.com/docs/authentication/getting-started
*/
const client = new speech.SpeechClient();

const app = require('express')();
const http = require('http').createServer(app);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client.html');
});
http.listen(80, () => {
  console.log('listening on *:3000');
});

const io = require('socket.io')(3000);
io.on('connection', socket => { 
  socket.on('abc', data => {

  });
});

const request = {
  config: {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'ko-KR',
  },
  interimResults: false,
};

const recognizeStream = client
.streamingRecognize(request)
.on('error', e => {console.log(recognizeStream); console.error(e);})
.on('data', data => {
  if (data.results[0] && data.results[0].alternatives[0])
  {
    const text = data.results[0].alternatives[0].transcript;
    io.emit('transcript', text);
    console.log(text);
  }
});

recorder.record({
  sampleRateHertz: 16000,
  threshold: 0.5,
  device: null,
  verbose: false,
  recordProgram: 'rec',
  silence: '10.0',
  audioType: 'waveaudio'
}).stream().on('error', console.error).pipe(recognizeStream);

console.log('Listening, press Ctrl+C to stop.');
