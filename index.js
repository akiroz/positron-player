const database = require('./database.js');
const decoder = require('./build/Release/decoder');

// DOM elements
const title = document.querySelector('#title')
const list = document.querySelector('#list-body');
const seekClickable = document.querySelector('#seek-clickable');
const seekProgress = document.querySelector('#seek-progress');
const playPauseButton = document.querySelector('#play-pause-button');
const visualizer = document.querySelector('#visualizer');

const aCtx = new AudioContext();

visualizer.width = 1000;
visualizer.height = 200;
const vCtx = visualizer.getContext('2d');

class Player {
  constructor() {
    this.analyzer = aCtx.createAnalyser();
    this.analyzer.fftSize = 2048;
    this.specData = new Float32Array(this.analyzer.frequencyBinCount);
    this.analyzer.connect(aCtx.destination);
    this.dest = this.analyzer;
    this.updateProgress();
    this.updateVisualizer();
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
  updateVisualizer() {
    this.analyzer.getFloatFrequencyData(this.specData);
    vCtx.strokeStyle = "#87CEEB";
    vCtx.lineWidth = "2";
    vCtx.clearRect(0,0,1000,200);
    vCtx.beginPath();
    for(var i = 0; i < this.specData.length; i++) {
      var x = Math.log(i+1)*150;
      var y = -this.specData[i]*2-30;
      if(i === 0) vCtx.moveTo(x,y);
      else vCtx.lineTo(x,y);
    }
    vCtx.stroke();
    window.requestAnimationFrame(this.updateVisualizer.bind(this));
  }
  onPlay() {
    playPauseButton.classList.remove('fa-play');
    playPauseButton.classList.add('fa-pause');
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
      this.src.connect(this.dest);
      this.src.start();
      this.startTime = aCtx.currentTime;
      this.onPlay();
    });
  }
  pause() {
    this.pauseTime = aCtx.currentTime;
    this.src.stop();
    this.src.disconnect();
    this.src = null;
    playPauseButton.classList.remove('fa-pause');
    playPauseButton.classList.add('fa-play');
  }
  stop() {
    this.pause();
    this.pauseTime = null;
  }
  resume() {
    if(this.buf) {
      this.src = aCtx.createBufferSource();
      this.src.buffer = this.buf;
      this.src.connect(this.dest);
      const offset = this.pauseTime - this.startTime;
      this.src.start(0, offset);
      this.startTime = aCtx.currentTime - offset;
      this.onPlay();
    }
  }
  seek(offset) {
    if(this.buf) {
      if(this.src) this.stop();
      this.src = aCtx.createBufferSource();
      this.src.buffer = this.buf;
      this.src.connect(this.dest);
      this.src.start(0, offset);
      this.startTime = aCtx.currentTime - offset;
      this.onPlay();
    }
  }
}

const player = new Player();

playPauseButton.addEventListener('click', e => {
  if(player.src) player.pause();
  else player.resume();
});
document.addEventListener('keydown', e => {
  if(e.key === ' ') {
    if(player.src) player.pause();
    else player.resume();
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

