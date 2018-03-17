const mdns = require('mdns');
const IPv6 = require('ip-address').Address6;

window.positronPeers = {};

let peerUpdateHandler = () => {};
function setPeerUpdateHandler(f) {
  peerUpdateHandler = f;
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

function advertiseServer(port) {
  mdns.createAdvertisement(
    mdns.tcp('positron'), port
  ).start();
}

module.exports = {
  onPeerUpdate: setPeerUpdateHandler,
  advertiseServer
};
