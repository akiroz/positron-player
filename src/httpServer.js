const cors = require('cors');
const express = require('express');
const http = require('http');
const mdns = require('mdns');
const database = require('./database.js');
const wavDecoder = require('../build/Release/decoder');

module.exports = {
  start(mediaPath) {
    const app = express();

    app.use(cors({
      exposedHeaders: ['X-Positron-Samples', 'X-Positron-SampleRate']
    }));

    const localAlbums = database.getLocalAlbums(mediaPath);
    app.get('/db', (_, res) => {
      res.json(localAlbums);
      res.end();
    });

    app.head('/media/:filePath(*.wav)', (req, res) => {
      wavDecoder.decode(
        `${mediaPath}/${req.params.filePath}`, false,
        (samples, sampleRate) => {
          res.set('X-Positron-Samples', samples);
          res.set('X-Positron-SampleRate', sampleRate);
          res.end();
        }
      );
    });

    app.get('/media/:filePath(*.wav)', (req, res) => {
      wavDecoder.decode(
        `${mediaPath}/${req.params.filePath}`, true,
        (samples, sampleRate, buf) => {
          res.set('X-Positron-Samples', samples);
          res.set('X-Positron-SampleRate', sampleRate);
          res.end(Buffer.from(buf));
        }
      );
    });

    app.use('/media', express.static(mediaPath));

    const server = http.createServer(app).listen();
    app.set('port', server.address().port);

    mdns.createAdvertisement(
      mdns.tcp('positron'),
      server.address().port
    ).start();
  }
};
