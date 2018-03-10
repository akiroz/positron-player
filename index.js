const database = require('./database.js');
const decoder = require('./build/Release/decoder');

// DOM elements
const titleDisplay = document.querySelector('#title')
const list = document.querySelector('#list-body');
const seekProgress = document.querySelector('#seek-progress');
const playPauseButton = document.querySelector('#play-pause-button');

class Player {
  constructor() {
    this.playing = false;
    this.aCtx = new AudioContext();
    this.src = this.aCtx.createBufferSource();
    this.src.addEventListener('ended', this._onEnded);
    this.src.connect(this.aCtx.destination);
    this.onStart = () => {};
    this.onStop = () => {};
  }
  play(fileName) {
    // Decode WAV and start playback
    decoder.decode(fileName, (samples, sampleRate, leftBuf, rightBuf) => {
      console.log(`Decoded sampleRate: ${sampleRate}, samples: ${samples}`);
      const buf = this.aCtx.createBuffer(2, samples, sampleRate);
      buf.copyToChannel(new Float32Array(leftBuf), 0);
      buf.copyToChannel(new Float32Array(rightBuf), 1);
      this.src.buffer = buf;
      this.src.start();
      this.playing = true;
      this.onStart();
    });
  }
  pause() {
    this.src.stop();
    this.playing = false;
    this.onStop();
  }
  _onEnded() {
    this.playing = false;
    this.onStop();
  }
}

const player = new Player();

player.onStart = () => {
  playPauseButton.classList.remove('fa-play');
  playPauseButton.classList.add('fa-pause');
}

player.onStop = () => {
  playPauseButton.classList.remove('fa-pause');
  playPauseButton.classList.add('fa-play');
}

playPauseButton.addEventListener('click', e => {
  if(player.playing) audio.pause();
  else audio.play();
});

// templating elements
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
    const row = document.importNode(template.content, true);
    row.querySelector('.list-row').addEventListener('click', e => {
      titleDisplay.textContent = `${track.title} - ${track.artist || album.artist}`;
      player.play(track.file);
    });
    list.appendChild(row);
  });
});

//document // update seek bar
//  .querySelector('audio')
//  .addEventListener('timeupdate', e => {
//    const p = e.timeStamp / (e.target.duration*1000);
//    console.log(p);
//    if(0 <= p && p <= 1) {
//      seekProgress.style.width = `${p*100}%`;
//    }
//  });

//document // seek-bar click
//  .querySelector('#seek-bar')
//  .addEventListener('click', e => {
//
//  });
