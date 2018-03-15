
class Transport {
  constructor({ title, playPauseButton, seekClickable, seekProgress }) {
    this.playPauseButton = document.querySelector(playPauseButton);
    this.seekClickable = document.querySelector(seekClickable);
    this.seekProgress = document.querySelector(seekProgress);
    this.title = document.querySelector(title)
    this.onPlayPause = null;
    this.onSeek = null;
    this.playPauseButton.addEventListener('click', e => {
      if(this.onPlayPause) {
        this.onPlayPause();
      }
    });
    document.addEventListener('keydown', e => {
      if(this.onPlayPause && e.key === ' ') {
        this.onPlayPause();
      }
    });
    this.seekClickable.addEventListener('click', e => {
      const p = e.offsetX / this.seekClickable.clientWidth;
      if(this.onSeek && 0 <= p && p <= 1) {
        this.onSeek(p);
      }
    });
  }
  setPlayState(playing) {
    if(playing) {
      this.playPauseButton.classList.remove('fa-play');
      this.playPauseButton.classList.add('fa-pause');
    } else {
      this.playPauseButton.classList.remove('fa-pause');
      this.playPauseButton.classList.add('fa-play');
    }
  }
  setProgress(p) {
    if(0 <= p && p <= 1) {
      this.seekProgress.style.width = `${p*100}%`;
    }
  }
  setTitle(text) {
    this.title.textContent = text;
  }
}

module.exports = Transport;
