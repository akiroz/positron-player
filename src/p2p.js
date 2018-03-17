const express = require('express');
const http = require('http');
const { ipcRenderer } = require('electron')
const database = require('./database.js');
const { advertiseServer, onPeerUpdate } = require('./mdns.js');
const { mediaPath } = ipcRenderer.sendSync('get-config');

const localAlbums = database.getLocalAlbums(mediaPath);
const app = express();

app.get('/db', (req, res) => {
  res.json(localAlbums);
  res.end();
});

app.use('/media', express.static('media'));

const server = http.createServer(app).listen();
app.set('port', server.address().port);
advertiseServer(server.address().port);


window.positronAlbums = {};

let listUpdateHandler = () => {};
function setListUpdateHandler(f) {
  listUpdateHandler = f;
}

onPeerUpdate(peerEntry => {
  const host = peerEntry.addresses[0];
  const peer = `${host}:${peerEntry.port}`;
  fetch(`http://${peer}/db`).then(r => r.json()).then(albums => {
    albums.forEach(album => {
      if(positronAlbums.hasOwnProperty(album.album)) {
        positronAlbums[album.album].peers.add(peer);
      } else {
        positronAlbums[album.album] = album;
        positronAlbums[album.album].peers = new Set([peer]);
      }
    });
    listUpdateHandler(positronAlbums);
  });
});

module.exports = {
  onListUpdate: setListUpdateHandler,
}
