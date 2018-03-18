const { app, ipcMain, BrowserWindow } = require('electron');
const httpServer = require('./httpServer.js');

if(!process.argv[2]) {
  console.error('err: no config file provided');
  process.exit(1);
}
const config = require(`${process.cwd()}/${process.argv[2]}`);
httpServer.start(config.mediaPath);

function die() {
  console.log('killed');
  httpServer.stop();
  process.exit();
}
process.on("SIGHUP", die);
process.on("SIGINT", die);
process.on("SIGQUIT", die);
process.on("SIGABRT", die);
process.on("SIGTERM", die);

let win;
app.on('ready', _ => {
  win = new BrowserWindow();
  win.on('close', die);
  win.loadURL(`file://${__dirname}/index/index.html`);
});

