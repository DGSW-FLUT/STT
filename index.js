//require('dotenv').config();
const recorder = require('node-record-lpcm16');
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

const app = require('express')();
const http = require('http');
const chosun_news = require('./lib/chosun-news');
const naver_issue = require('./lib/naver-issue');
const youtube_api = require('./lib/youtube_api');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client.html');
  res.status(200);
});
app.get('/css/*', (req, res) => {
  let str = __dirname + '/views/css/' + decodeURI(req.originalUrl.substr('/css/'.length));
  if (str.indexOf('?') != -1) str = str.substring(0, str.indexOf('?'));
  res.sendFile(str);
  res.status(200);
});
app.get('/asset/*', (req, res) => {
  let str = __dirname + '/views/assets/' + decodeURI(req.originalUrl.substr('/asset/'.length));
  if (str.indexOf('?') != -1) str = str.substring(0, str.indexOf('?'));
  res.sendFile(str);
  res.status(200);
});
app.get('/views/*', (req, res) => {
  let str = __dirname + '/views/' + decodeURI(req.originalUrl.substr('/views/'.length));
  if (str.indexOf('?') != -1) str = str.substring(0, str.indexOf('?'));
  res.sendFile(str);
  res.status(200);
});
http.createServer(app).listen(80, () => {
  console.log('listening on *:3000');
});

const io = require('socket.io')(3000);
io.on('connection', socket => { 
  socket.on('debug', data => {
    transcriptProcess(data);
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

const processSelectingYoutube = (youtube_data) => {
  state = 'YOUTUBE SHOW';
  youtube_api.info(youtube_data.videoId, (data) => {
    io.emit('page youtube show', youtube_data);
    let str = data.items[0].contentDetails.duration.substring(2);
    let minutes = str.substring(0, str.indexOf('M'));
    str = str.substring(str.indexOf('M') + 1);
    let seconds = str.substring(0, str.length - 1);
    
    console.log('It takes ' + (minutes * 60 + seconds) + 'seconds.');
    setTimeout(() => { console.log('It\'s gone'); io.emit('page lobby', null); },
    (minutes * 60 + seconds + 2) * 1000); //Two seconds for latency
  });
};

var state = 'WAIT';
var youtube_data = null;
const transcriptProcess = (text) => {
  switch (state)
  {
    case 'WAIT':
      if (text.indexOf('뉴스') != -1)
      {
        const path_map = {
          'politics': '/ranking/rss/www/politics/list.xml',
          'national': '/ranking/rss/www/national/list.xml',
          'international': '/ranking/rss/www/international/list.xml',
          'sports': '/ranking/rss/www/sports/list.xml',
          'star': '/ranking/rss/www/star/list.xml',
          'culture': '/ranking/rss/www/culture/list.xml'
        }
        const type_list = [
          '정치', '국내시사', '국제시사', '스포츠', '연예', '문화'
        ]
        let type = Math.floor(Math.random() * (Object.keys(path_map).length + 1));
        if (text.indexOf('정치') != -1) type = 0;
        if (text.indexOf('국내') != -1) type = 1;
        if (text.indexOf('국제') != -1 || text.indexOf('해외') != -1) type = 2;
        if (text.indexOf('스포츠') != -1) type = 3;
        if (text.indexOf('연예') != -1) type = 4;
        if (text.indexOf('문화') != -1) type = 5;
        chosun_news.parse('/ranking/rss/www/politics/list.xml', (headlines) => {
          io.emit('page news', {'title':type_list[type] + ' 부문', 'headlines': headlines});
        });
      }
      else if (text.indexOf('실검') != -1)
      {
        naver_issue.parse((data) => {
          console.log(data);
          io.emit('page naver', {'words': data});
        });
      }
      else if (text.indexOf('유튜브') != -1)
      {
        state = 'YOUTUBE RECORD';
        io.emit('page youtube record', null);
      }
      break;
    case 'YOUTUBE RECORD':
      state = 'YOUTUBE SEARCH';
      youtube_api.search(text, (data) => {
        youtube_data = data;
        io.emit('page youtube search', {'header': text, 'data': data});
      });
      
      break;
    case 'YOUTUBE SEARCH':
      if (text.indexOf('그만') != -1 ||
          text.indexOf('취소') != -1 ||
          text.indexOf('메뉴') != -1 ||
          text.indexOf('로비') != -1)
      {
        io.emit('page lobby', null);
      } 
      else if (text.indexOf('첫번째') != -1)
      {
        processSelectingYoutube(youtube_data[0]);
      }
      else if (text.indexOf('두번째') != -1)
      {
        processSelectingYoutube(youtube_data[1]);
      }
      else if (text.indexOf('세번째') != -1)
      {
        processSelectingYoutube(youtube_data[2]);
      }
      else if (text.indexOf('네번째') != -1)
      {
        processSelectingYoutube(youtube_data[3]);
      }
      else if (text.indexOf('다섯번째') != -1)
      {
        processSelectingYoutube(youtube_data[4]);
      }
      else if (text.indexOf('여섯번째') != -1)
      {
        processSelectingYoutube(youtube_data[5]);
      }
      break;
    case 'YOUTUBE SHOW':
      if (text.indexOf('그만') != -1 ||
        text.indexOf('취소') != -1 ||
        text.indexOf('메뉴') != -1 ||
        text.indexOf('로비') != -1)
      {
        io.emit('page lobby', null);
      } 
      break;
  }
};

const recognizeStream = client
.streamingRecognize(request)
.on('error', e => {console.log(recognizeStream); console.error(e);})
.on('data', data => {
  if (data.results[0] && data.results[0].alternatives[0])
  {
    const text = data.results[0].alternatives[0].transcript;
    transcriptProcess(text);
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
