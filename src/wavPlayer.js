
class WavPlayer {
  constructor({ audioCtx }) {
    this.ctx = audioCtx;
    this.src = null;
    this.samples = null;
    this.sampleRate = null;
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
  play(url) {
    if(url) {
      if(this.src) this.pause();
      fetch(
        url, { method: 'head' }
      ).then(({ headers }) => {
        this.samples = headers.get('X-Positron-Samples');
        this.sampleRate = headers.get('X-Positron-SampleRate');
        this.duration = this.samples / this.sampleRate;
        this.buf = this.ctx.createBuffer(2, this.samples, this.sampleRate);
        // TODO: fetch from multiple nodes
        return fetch(url);
      }).then(res => res.arrayBuffer()).then(buf => {
        const lrBuf = new Float32Array(buf);
        const leftBuf = this.buf.getChannelData(0);
        const rightBuf = this.buf.getChannelData(1);
        for(var i = 0; i < this.samples; i++) {
          leftBuf[i] = lrBuf[i*2];
          rightBuf[i] = lrBuf[i*2+1];
        }
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

