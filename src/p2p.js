const mdns = require('mdns');
const IPv6 = require('ip-address').Address6;

window.positronPeers = {};
window.positronAlbums = {};

let listUpdateHandler = () => {};
function setListUpdateHandler(f) {
  listUpdateHandler = f;
}

// handle peer update
function peerUpdateHandler(added, peerEntry) {
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
}

// search for peers
const positronBrowser = mdns.createBrowser(mdns.tcp('positron'));
positronBrowser.on('serviceUp', ({ addresses, port, name }) => {
  // add peer
  if(!positronPeers.hasOwnProperty[name]) {
    positronPeers[name] = {
      addresses: addresses.filter(a => !(new IPv6(a).isValid())),
      port, name
    };
    peerUpdateHandler(true, positronPeers[name], positronPeers);
  }
});
positronBrowser.on('serviceDown', ({ name }) => {
  delete positronPeers[name];
  peerUpdateHandler(false, name, positronPeers);
});
positronBrowser.start();

module.exports = {
  onListUpdate: setListUpdateHandler,
}

