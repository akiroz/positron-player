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

app.use('/media', express.static(mediaPath));

const server = http.createServer(app).listen();
app.set('port', server.address().port);
advertiseServer(server.address().port);


window.positronAlbums = {};

let listUpdateHandler = () => {};
function setListUpdateHandler(f) {
  listUpdateHandler = f;
}

onPeerUpdate((added, peerEntry) => {
  if(added) {
    const host = peerEntry.addresses[0];
    const peer = `${host}:${peerEntry.port}`;
    fetch(`http://${peer}/db`).then(r => r.json()).then(albums => {
      albums.forEach(album => {
        if(positronAlbums.hasOwnProperty(album.album)) {
          positronAlbums[album.album].peers[peerEntry.name] = peer;
        } else {
          positronAlbums[album.album] = album;
          positronAlbums[album.album].peers = {[peerEntry.name]: peer};
        }
      });
      listUpdateHandler(positronAlbums);
    });
  } else {
    Object.entries(positronAlbums).forEach(([name, album]) => {
      if(album.peers.hasOwnProperty(peerEntry)) {
        delete positronAlbums[name].peers[peerEntry];
        if(Object.keys(positronAlbums[name].peers).length === 0) {
          delete positronAlbums[name];
        }
      }
    });
  }
});

module.exports = {
  onListUpdate: setListUpdateHandler,
}
