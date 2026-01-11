
const { app, BrowserWindow, shell, dialog, protocol } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('disable-gpu-cache');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-gpu'); 

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

protocol.registerSchemesAsPrivileged([
  { scheme: 'lumina', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

function createWindow() {
  app.name = "Lumina Browser";

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Lumina Browser',
    backgroundColor: '#0f172a',
    show: false, 
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadURL('lumina://app/index.html');
  
  win.webContents.openDevTools();

  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });
}

const userDataPath = path.join(app.getPath('appData'), 'LuminaBrowserData');
app.setPath('userData', userDataPath);

app.whenReady().then(() => {
  protocol.handle('lumina', (request) => {
    const urlPath = request.url.replace('lumina://app/', '');
    const filePath = path.join(__dirname, urlPath.split('?')[0]);
    
    if (!fs.existsSync(filePath)) {
      if (filePath.endsWith('.css')) {
        return new Response('', { headers: { 'Content-Type': 'text/css' } });
      }
      return new Response('Not Found', { status: 404 });
    }

    try {
      const extension = path.extname(filePath);
      let contentType = 'text/html';
      
      // Serve TSX/TS as text/plain so Babel fetches but browser doesn't execute
      if (extension === '.tsx' || extension === '.ts') {
        contentType = 'text/plain'; 
      } else if (extension === '.js') {
        contentType = 'application/javascript';
      } else if (extension === '.css') {
        contentType = 'text/css';
      } else if (extension === '.json') {
        contentType = 'application/json';
      } else if (extension === '.svg') {
        contentType = 'image/svg+xml';
      } else if (extension === '.png') {
        contentType = 'image/png';
      } else if (extension === '.jpg' || extension === '.jpeg') {
        contentType = 'image/jpeg';
      }

      return new Response(fs.readFileSync(filePath), {
        headers: { 'Content-Type': contentType }
      });
    } catch (e) {
      return new Response('Internal Error', { status: 500 });
    }
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
