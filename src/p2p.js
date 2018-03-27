const mdns = require('mdns');
const IPv6 = require('ip-address').Address6;

window.positronPeers = {};
window.positronAlbums = {};

let listUpdateHandler = () => {};
function setListUpdateHandler(f) {
  listUpdateHandler = f;
}

// search for peers
const positronBrowser = mdns.createBrowser(mdns.tcp('positron'));

// Add peer
positronBrowser.on('serviceUp', ({ addresses, port, name }) => {
  if(!positronPeers.hasOwnProperty[name]) {
    positronPeers[name] = {
      addresses: addresses.filter(a => !(new IPv6(a).isValid())),
      port,
      name
    };
    // use first address
    const host = positronPeers[name].addresses[0];
    const peer = `${host}:${positronPeers[name].port}`;
    // fetch album list
    fetch(`http://${peer}/db`).then(r => r.json()).then(albums => {
      albums.forEach(album => {
        if(positronAlbums.hasOwnProperty(album.album)) {
          positronAlbums[album.album].peers[name] = peer;
        } else {
          positronAlbums[album.album] = album;
          positronAlbums[album.album].peers = {[name]: peer};
        }
      });
      listUpdateHandler(positronAlbums);
    });
  }
});

// Remove peer
positronBrowser.on('serviceDown', ({ name: peerName }) => {
  delete positronPeers[peerName];
  Object.entries(positronAlbums).forEach(([name, album]) => {
    if(album.peers.hasOwnProperty(peerName)) {
      delete positronAlbums[name].peers[peerName];
      if(Object.keys(positronAlbums[name].peers).length === 0) {
        delete positronAlbums[name];
      }
    }
  });
  listUpdateHandler(positronAlbums);
});

positronBrowser.start();

module.exports = {
  onListUpdate: setListUpdateHandler,
}

