const p2p = require('../p2p.js');
const Visualizer = require('../visualizer.js');
const Transport = require('../transport.js');
const WavPlayer = require('../wavPlayer.js');
const AudioPlayer = require('../audioPlayer.js');
const VideoPlayer = require('../videoPlayer.js');

const audioCtx = new AudioContext();

const audioPlayer = new AudioPlayer({
  audioCtx
});

const videoPlayer = new VideoPlayer({
  audioCtx,
  video: 'video'
});

const wavPlayer = new WavPlayer({
  audioCtx
});

const visualizer = new Visualizer({
  audioCtx,
  canvas: '#visualizer'
});
visualizer.analyzer.connect(audioCtx.destination);

const transport = new Transport({
  playPauseButton: '#play-pause-button',
  seekClickable: '#seek-clickable',
  seekProgress: '#seek-progress'
});

function connectPlayer(player, isVideo) {
  if(isVideo) {
    player.connect(audioCtx.destination);
  } else {
    player.connect(visualizer.analyzer);
  }
  transport.onPlayPause = _ => {
    if(player.isPlaying()) player.pause();
    else player.play();
  };
  transport.onSeek = percent => {
    player.seek(percent);
  };
  player.onPlayStateChange = playing => {
    console.log(`play state: ${playing?'|>':'||'}`);
    transport.setPlayState(playing);
    if(isVideo) {
      if(playing) videoSection.classList.add('video-section-show');
      else videoSection.classList.remove('video-section-show');
    }
  };
  player.onProgressUpdate = percent => {
    transport.setProgress(percent);
  };
  return player;
}

const videoSection = document.querySelector('#video-section');
let player = connectPlayer(wavPlayer);
function playTrack(album, track) {
  transport.setTitle(`${track.title} - ${track.artist || album.artist}`);
  player.pause();
  player.disconnect();
  const firstPeer = Object.values(album.peers)[0];
  const urlList = Object.values(album.peers)
    .map(p => `http://${p}/${track.file}`);
  switch(track.fileType) {
    case "WAV":
      player = connectPlayer(wavPlayer);
      player.play(urlList);
      break;
    case "MP3":
    case "FLAC":
      player = connectPlayer(audioPlayer);
      player.play(urlList[0]);
      break;
    default:
      player = connectPlayer(videoPlayer, true);
      player.play(urlList, track.fileType);
      break;
  }
}

const list = document.querySelector('#list-body');
const template = document.querySelector('#list-row-template');
const templateAlbum =
  template.content.querySelector('.list-row-album');
const templateAlbumName =
  template.content.querySelector('.list-row-album-name');
const templateAlbumArtwork =
  template.content.querySelector('.list-row-album-artwork');
const templateTrack =
  template.content.querySelector('.list-row-track');
const templateTitle =
  template.content.querySelector('.list-row-title');
const templateArtist =
  template.content.querySelector('.list-row-artist');
const templateFileType =
  template.content.querySelector('.list-row-file-type');
const templateNodes =
  template.content.querySelector('.list-row-nodes');

p2p.onListUpdate(albums => {
  list.innerHTML = '';
  Object.values(albums).forEach(album => {
    const firstPeer = Object.values(album.peers)[0];
    templateAlbumName.textContent = album.album;
    templateAlbumArtwork.src = `http://${firstPeer}/${album.artwork}`;
    templateArtist.textContent = album.artist;
    templateAlbum.rowSpan = album.tracks.length;
    let firstTrack = true;
    // iterate tracks
    album.tracks.forEach(track => {
      if(firstTrack) {
        templateAlbum.style.display = "table-cell";
        firstTrack = false;
      } else {
        templateAlbum.style.display = "none";
      }
      templateTrack.textContent = track.track;
      templateTitle.textContent = track.title;
      if(track.artist) {
        templateArtist.textContent = track.artist;
      }
      templateFileType.textContent = track.fileType;
      templateNodes.textContent = Object.values(album.peers).join(' ');
      const row = document.importNode(template.content, true);
      row.querySelector('.list-row')
        .addEventListener('click', e => playTrack(album, track));
      list.appendChild(row);
    });
  });
});

