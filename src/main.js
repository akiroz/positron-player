const { app, ipcMain, BrowserWindow } = require('electron');

if(!process.argv[2]) {
  console.error('err: no config file provided');
  process.exit(1);
}
const config = require(`${process.cwd()}/${process.argv[2]}`);

ipcMain.on('get-config', e => {
  e.returnValue = config;
});

let win;
app.on('ready', _ => {
  win = new BrowserWindow();
  win.loadURL(`file://${__dirname}/index/index.html`);
});

