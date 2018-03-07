const database = require('./database.js');

const audio = document.querySelector('audio');
const titleDisplay = document.querySelector('#title')

window // page load
  .addEventListener('load', e => {
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
          audio.src = track.file;
        });
        list.appendChild(row);
      });
    });
  });

const seekProgress = document.querySelector('#seek-progress');
document // update seek bar
  .querySelector('audio')
  .addEventListener('timeupdate', e => {
    const p = e.timeStamp / (e.target.duration*1000);
    console.log(p);
    if(0 <= p && p <= 1) {
      seekProgress.style.width = `${p*100}%`;
    }
  });

const playPauseButton = document.querySelector('#play-pause-button');
document // update seek bar
  .querySelector('audio')
  .addEventListener('play', e => {
    playPauseButton.classList.remove('fa-play');
    playPauseButton.classList.add('fa-pause');
  });

document // update seek bar
  .querySelector('audio')
  .addEventListener('pause', e => {
    playPauseButton.classList.remove('fa-pause');
    playPauseButton.classList.add('fa-play');
  });

document // play/pause button click
  .querySelector('#play-pause-button')
  .addEventListener('click', e => {
    if(audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  });

document // seek-bar click
  .querySelector('#seek-bar')
  .addEventListener('click', e => {

  });
