const database = require('../database.js');
const Visualizer = require('../visualizer.js');
const Transport = require('../transport.js');
const WavPlayer = require('../wavPlayer.js');

const audioCtx = new AudioContext();
const player = new WavPlayer({ audioCtx });
const visualizer = new Visualizer({
  audioCtx,
  canvas: '#visualizer'
});
const transport = new Transport({
  title: '#title',
  playPauseButton: '#play-pause-button',
  seekClickable: '#seek-clickable',
  seekProgress: '#seek-progress'
});

player.connect(visualizer.analyzer);
visualizer.analyzer.connect(audioCtx.destination);

transport.onPlayPause = _ => {
  if(player.isPlaying()) player.pause();
  else player.play();
};
transport.onSeek = percent => {
  player.seek(percent);
};

player.onPlayStateChange = playing => {
  transport.setPlayState(playing);
};
player.onProgressUpdate = percent => {
  transport.setProgress(percent);
};

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

// iterate albums
database.forEach(album => {
  templateAlbumName.textContent = album.album;
  templateAlbumArtwork.src = album.artwork;
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
    const row = document.importNode(template.content, true);
    row.querySelector('.list-row').addEventListener('click', e => {
      transport.setTitle(`${track.title} - ${track.artist || album.artist}`);
      player.play(track.file);
    });
    list.appendChild(row);
  });
});

