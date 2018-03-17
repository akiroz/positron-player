const fs   = require('fs');
const yaml = require('js-yaml');

const rootPath = process.cwd();
const mediaPath = `${rootPath}/media`;

const localAlbums = fs.readdirSync(mediaPath)
  .filter(file => {
    return fs.statSync(`${mediaPath}/${file}`).isDirectory();
  })
  .map(albumName => {
    const albumYmlPath = `${mediaPath}/${albumName}/album.yml`;
    const albumYml = fs.readFileSync(albumYmlPath, 'utf8');
    const { tracks, artist: albumArtist } = yaml.safeLoad(albumYml);
    return {
      album: albumName,
      artwork: `${mediaPath}/${albumName}/cover.jpg`,
      tracks: tracks.map(track => ({
        track: track.track,
        title: track.title,
        artist: track.artist || albumArtist,
        file: `${mediaPath}/${albumName}/${track.file}`,
        fileType: track.file.split('.').pop().toUpperCase()
      }))
    };
  });

module.exports = {
  getAlbums(callback) {
    callback(localAlbums);
  }
}
