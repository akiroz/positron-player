const database = require('./database.js');
const decoder = require('./build/Release/decoder');
const aCtx = new AudioContext();

// DOM elements
const title = document.querySelector('#title')
const list = document.querySelector('#list-body');
const seekClickable = document.querySelector('#seek-clickable');
const seekProgress = document.querySelector('#seek-progress');
const playPauseButton = document.querySelector('#play-pause-button');
const time = document.querySelector('#time')
const duration = document.querySelector('#duration')

class Player {
  constructor() {
    this.updateProgress();
  }
  updateProgress() {
    if(this.src && this.startTime && this.duration) {
      const p = (aCtx.currentTime - this.startTime) / this.duration;
      if(0 <= p && p <= 1) {
        seekProgress.style.width = `${p*100}%`;
      }
    }
    window.requestAnimationFrame(this.updateProgress.bind(this));
  }
  play(fileName) {
    if(this.src) this.stop();
    // Decode WAV and start playback
    decoder.decode(fileName, (samples, sampleRate, leftBuf, rightBuf) => {
      console.log(`Decoded: ${fileName}`);
      console.log(`sampleRate: ${sampleRate}, samples: ${samples}`);
      this.duration = samples / sampleRate;
      this.buf = aCtx.createBuffer(2, samples, sampleRate);
      this.buf.copyToChannel(new Float32Array(leftBuf), 0);
      this.buf.copyToChannel(new Float32Array(rightBuf), 1);
      this.src = aCtx.createBufferSource();
      this.src.buffer = this.buf;
      this.src.connect(aCtx.destination);
      this.src.start();
      this.startTime = aCtx.currentTime;
    });
  }
  pause() {
    this.pauseTime = aCtx.currentTime;
    this.src.stop();
    this.src.disconnect();
    this.src = null;
  }
  stop() {
    this.pause();
    this.pauseTime = null;
  }
  resume() {
    if(this.buf) {
      this.src = aCtx.createBufferSource();
      this.src.buffer = this.buf;
      this.src.connect(aCtx.destination);
      const offset = this.pauseTime - this.startTime;
      this.src.start(0, offset);
      this.startTime = aCtx.currentTime - offset;
    }
  }
  seek(offset) {
    if(this.buf) {
      if(this.src) this.stop();
      this.src = aCtx.createBufferSource();
      this.src.buffer = this.buf;
      this.src.connect(aCtx.destination);
      this.src.start(0, offset);
      this.startTime = aCtx.currentTime - offset;
    }
  }
}

const player = new Player();

playPauseButton.addEventListener('click', e => {
  if(player.src) {
    player.pause();
    playPauseButton.classList.remove('fa-pause');
    playPauseButton.classList.add('fa-play');
  } else {
    player.resume();
    playPauseButton.classList.remove('fa-play');
    playPauseButton.classList.add('fa-pause');
  }
});

seekClickable.addEventListener('click', e => {
  const p = e.offsetX / e.target.clientWidth;
  if(0 <= p && p <= 1) {
    player.seek(p * player.duration);
  }
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
      title.textContent = `${track.title} - ${track.artist || album.artist}`;
      player.play(track.file);
    });
    list.appendChild(row);
  });
});

