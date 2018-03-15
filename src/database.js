const mediaPath = `${__dirname}/../media`
const data = [
  {
    album: "Grimoire of Emerald",
    artist: "Team Grimoire",
    artwork: "Grimoire of Emerald/cover.jpeg",
    tracks: [
      {
        track: 2,
        title: "Arthur ~once Upon a Time~",
        file: "Grimoire of Emerald/02 - Arthur ~once Upon a Time~.wav"
      },
      {
        track: 3,
        title: "Brionac ~Lugh Lamhfhata~",
        file: "Grimoire of Emerald/03 - Brionac ~Lugh Lamhfhata~.wav"
      },
      {
        track: 4,
        title: "Caliburne ~Story of the Legendary sword~",
        file: "Grimoire of Emerald/04 - Caliburne ~Story of the Legendary sword~.wav"
      },
      {
        track: 5,
        title: "Dáinsleif ~the Gold Curse~",
        file: "Grimoire of Emerald/05 - Dáinsleif ~the Gold Curse~.wav"
      }
    ]
  },
  {
    album: "Miracle Milk",
    artist: "Mili",
    artwork: "Miracle Milk/cover.jpeg",
    tracks: [
      {
        track: 2,
        title: "Ga1ahad and Scientific Witchery",
        file: "Miracle Milk/02 - Ga1ahad and Scientific Witchery.wav"
      },
      {
        track: 6,
        title: "Vulnerability",
        file: "Miracle Milk/06 - Vulnerability.wav"
      },
      {
        track: 7,
        title: "与我共鳴 -NENTEN-",
        file: "Miracle Milk/07 - 与我共鳴 -NENTEN-.wav"
      },
      {
        track: 11,
        title: "world.execute(me);",
        file: "Miracle Milk/11 - world.execute(me);.wav"
      },
      {
        track: 12,
        title: "Utopiosphere -Platonism-",
        file: "Miracle Milk/12 - Utopiosphere -Platonism-.wav"
      },
      {
        track: 15,
        title: "Sl0t",
        file: "Miracle Milk/15 - Sl0t.wav"
      }
    ]
  },
  {
    album: "NO SONG NO LIFE",
    artwork: "NO SONG NO LIFE/cover.jpeg",
    tracks: [
      {
        track: 1,
        title: "Overture",
        artist: "Yoshiaki Fujisawa",
        file: "NO SONG NO LIFE/01. Overture.wav"
      },
      {
        track: 5,
        title: "Bias Hacker",
        artist: "Ai Kayano & Yoko Hikasa & Yukari Tamura",
        file: "NO SONG NO LIFE/05. Bias Hacker.wav"
      },
      {
        track: 9,
        title: "This game",
        artist: "Konomi Suzuki",
        file: "NO SONG NO LIFE/09. This game.wav"
      },
      {
        track: 10,
        title: "THERE IS A REASON",
        artist: "Konomi Suzuki",
        file: "NO SONG NO LIFE/10. THERE IS A REASON.wav"
      }
    ]
  },
  {
    album: "A Sugar Business",
    artwork: "A Sugar Business/cover.jpeg",
    tracks: [
      {
        track: 1,
        title: "Thrives On",
        artist: "Taishi, Electro.muster",
        file: "A Sugar Business/1-Thrives On.mp3"
      },
      {
        track: 2,
        title: "Giant Killing",
        artist: "Wata, WOM",
        file: "A Sugar Business/2-Giant Killing.mp3"
      },
      {
        track: 3,
        title: "A Sugar Business",
        artist: "Taishi, Electro.muster",
        file: "A Sugar Business/3-A Sugar Business.mp3"
      },
      {
        track: 4,
        title: "Amazing Sweet",
        artist: "Grok, WOM",
        file: "A Sugar Business/4-Amazing Sweet.mp3"
      },
      {
        track: 5,
        title: "Think The Future -Club Extend-",
        artist: "Taishi, Electro.muster",
        file: "A Sugar Business/5-Think The Future -Club Extend-.mp3"
      },
    ]
  },
  {
    album: "",
    artist: "WAiKURO",
    artwork: "AMAZING MIGHTYYYY!!!!/【maimaiPV確認】AMAZING MIGHTYYYY!!!! _WAiKURO-nH_2rssTJtM.jpg",
    tracks: [
      {
        track: 1,
        title: "AMAZING MIGHTYYYY!!!!",
        file: "AMAZING MIGHTYYYY!!!!/【maimaiPV確認】AMAZING MIGHTYYYY!!!! _WAiKURO-nH_2rssTJtM.mkv"
      },
    ]
  },
  {
    album: "",
    artist: "Sakuzyo",
    artwork: "天火明命/【音源】【PV確認用】天火明命（編集有り）-NknFuXq1NP4.jpg",
    tracks: [
      {
        track: 1,
        title: "天火明命",
        file: "天火明命/【音源】【PV確認用】天火明命（編集有り）-NknFuXq1NP4.mkv"
      },
    ]
  },
  {
    album: "",
    artist: "uma vs. モリモリあつし",
    artwork: "Re：End of a Dream/【BOFU2016】Re：End of a Dream _ uma vs. モリモリあつし【BGA】-ayg2A2JoRzg.jpg",
    tracks: [
      {
        track: 1,
        title: "Re：End of a Dream",
        file: "Re：End of a Dream/【BOFU2016】Re：End of a Dream _ uma vs. モリモリあつし【BGA】-ayg2A2JoRzg.mkv"
      },
    ]
  },
];

module.exports = data.map(album => {
  album.artwork = `${mediaPath}/${album.artwork}`;
  album.tracks = album.tracks.map(track => {
    track.file = `${mediaPath}/${track.file}`;
    track.fileType = track.file.split('.').pop().toUpperCase();
    return track;
  });
  return album;
});

