
const { app, BrowserWindow } = require('electron');

let win;
app.on('ready', _ => {
  win = new BrowserWindow();
  win.loadURL(`file://${__dirname}/index/index.html`);
});

