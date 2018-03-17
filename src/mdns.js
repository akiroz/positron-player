const mdns = require('mdns');
const IPv6 = require('ip-address').Address6;
const { ipcRenderer } = require('electron')
const { nodeID } = ipcRenderer.sendSync('get-config');

window.positronPeers = {};

let peerUpdateHandler = () => {};
function setPeerUpdateHandler(f) {
  peerUpdateHandler = f;
}

// search for peers
const positronBrowser = mdns.createBrowser(mdns.tcp('positron'));
positronBrowser.on('serviceUp', ({ addresses, port, txtRecord }) => {
  if(txtRecord.nodeID) {
    // add peer
    console.log(`New peer: ${txtRecord.nodeID}`);
    positronPeers[txtRecord.nodeID] = {
      addresses: addresses.filter(a => !(new IPv6(a).isValid())),
      port
    };
    peerUpdateHandler(positronPeers[txtRecord.nodeID], positronPeers);
  }
});
positronBrowser.start();

function advertiseServer(port) {
  mdns.createAdvertisement(
    mdns.tcp('positron'), port, {
      txtRecord: { nodeID }
    }
  ).start();
}

module.exports = {
  onPeerUpdate: setPeerUpdateHandler,
  advertiseServer
};
