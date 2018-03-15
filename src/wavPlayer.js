
const wavDecoder = require('../build/Release/decoder');

class WavPlayer {
  constructor({ audioCtx }) {
    this.ctx = audioCtx;
    this.src = null;
    this.buf = null;
    this.dest = null;
    this.duration = null;
    this.startTime = null;
    this.pauseTime = null;
    this.onPlayStateChange = null;
    this.onProgressUpdate = null;
    this._updateProgress();
  }
  _updateProgress() {
    if(this.src && this.onProgressUpdate) {
      const p = (this.ctx.currentTime - this.startTime) / this.duration;
      this.onProgressUpdate(p);
    }
    window.requestAnimationFrame(this._updateProgress.bind(this));
  }
  connect(dest) {
    this.dest = dest;
  }
  disconnect() {
    this.pause();
  }
  isPlaying() {
    return this.src != null;
  }
  play(fileName) {
    if(fileName) {
      if(this.src) this.pause();
      wavDecoder.decode(fileName, (samples, sampleRate, leftBuf, rightBuf) => {
        this.duration = samples / sampleRate;
        this.buf = this.ctx.createBuffer(2, samples, sampleRate);
        this.buf.copyToChannel(new Float32Array(leftBuf), 0);
        this.buf.copyToChannel(new Float32Array(rightBuf), 1);
        this.src = this.ctx.createBufferSource();
        this.src.buffer = this.buf;
        this.src.connect(this.dest);
        this.src.start();
        this.startTime = this.ctx.currentTime;
      });
    } else if(this.buf) {
      const offset = this.pauseTime - this.startTime;
      this.src = this.ctx.createBufferSource();
      this.src.buffer = this.buf;
      this.src.connect(this.dest);
      this.src.start(0, offset);
      this.startTime = this.ctx.currentTime - offset;
    }
    if(this.onPlayStateChange) {
      this.onPlayStateChange(true);
    }
  }
  pause() {
    if(this.src) {
      this.pauseTime = this.ctx.currentTime;
      this.src.stop();
      this.src.disconnect();
      this.src = null;
    }
    if(this.onPlayStateChange) {
      this.onPlayStateChange(false);
    }
  }
  seek(p) {
    if(this.buf && 0 <= p && p <= 1) {
      if(this.src) this.pause();
      const offset = this.duration * p;
      this.src = this.ctx.createBufferSource();
      this.src.buffer = this.buf;
      this.src.connect(this.dest);
      this.src.start(0, offset);
      this.startTime = this.ctx.currentTime - offset;
      if(this.onPlayStateChange) {
        this.onPlayStateChange(true);
      }
    }
  }
}

module.exports = WavPlayer;

