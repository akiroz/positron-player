
class VideoPlayer {
  constructor({ audioCtx, video }) {
    this.ctx = audioCtx;
    this.video = document.querySelector(video);
    this.video.autoplay = true;
    this.src = this.ctx.createMediaElementSource(this.video);
    this.onPlayStateChange = null;
    this.onProgressUpdate = null;
    this.video.addEventListener('timeupdate', e => {
      if(this.onProgressUpdate) {
        const p = this.video.currentTime/this.video.duration;
        this.onProgressUpdate(p);
      }
    });
  }
  connect(dest) {
    this.src.connect(dest);
  }
  disconnect() {
    this.src.disconnect();
  }
  isPlaying() {
    return !this.video.paused;
  }
  play(fileName) {
    if(fileName) {
      this.video.src = fileName;
    } else {
      this.video.play();
    }
    if(this.onPlayStateChange) {
      this.onPlayStateChange(true);
    }
  }
  pause() {
    this.video.pause();
    if(this.onPlayStateChange) {
      this.onPlayStateChange(false);
    }
  }
  seek(p) {
    if(0 <= p && p <= 1) {
      this.video.currentTime = this.video.duration * p;
    }
  }
}

module.exports = VideoPlayer;

