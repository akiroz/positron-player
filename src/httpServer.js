const express = require('express');
const cors = require('cors');
const range = require('express-range');
const http = require('http');
const mdns = require('mdns');
const database = require('./database.js');
const wavDecoder = require('../build/Release/decoder');

let serviceAd = null;

module.exports = {
  start(mediaPath) {
    const app = express();

    app.use(cors({
      exposedHeaders: ['X-Positron-Samples', 'X-Positron-SampleRate']
    }));

    app.use(range({ accept: 'samples' }));

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

    app.get('/media/:filePath(*.wav)', ({
      params: { filePath }, range
    }, res) => {
      wavDecoder.decode(
        `${mediaPath}/${filePath}`, true,
        (samples, sampleRate, buf) => {
          res.set('X-Positron-Samples', samples);
          res.set('X-Positron-SampleRate', sampleRate);
          const sampleSize = 4*2; // float * stereo
          if(range) {
            res.range({
              first: range.first,
              last: range.last,
              length: buf.byteLength/sampleSize
            });
            res.end(Buffer.from(
              buf,
              range.first*sampleSize,
              (range.last-range.first+1)*sampleSize
            ));
          } else {
            res.end(Buffer.from(buf));
          }
        }
      );
    });

    app.use('/media', express.static(mediaPath));

    const server = http.createServer(app).listen();
    app.set('port', server.address().port);

    serviceAd = mdns.createAdvertisement(
      mdns.tcp('positron'),
      server.address().port
    );
    serviceAd.start();
  },
  stop() {
    if(serviceAd) serviceAd.stop();
  }
};


