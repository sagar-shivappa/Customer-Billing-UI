const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn, execSync } = require('child_process');
const http = require('http');

let backendProcess;

const backendPath = app.isPackaged
  ? path.join(process.resourcesPath, 'backend')
  : path.join(__dirname, '..', 'backend');

function startBackend() {
  return new Promise((resolve, reject) => {
    const nodeExecutable = process.platform === 'win32' ? 'node.exe' : 'node';

    backendProcess = spawn(
      nodeExecutable,
      [path.join(backendPath, 'src', 'server.js'), '--production'],
      {
        cwd: backendPath,
        windowsHide: true,
      },
    );

    backendProcess.stdout.on('data', (data) => {
      console.log(`[Backend] ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`[Backend] ${data}`);
    });

    backendProcess.on('error', (error) => {
      console.error('Failed to start backend:', error);
      reject(error);
    });

    backendProcess.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`);
    });

    waitForBackend().then(resolve).catch(reject);
  });
}

function waitForBackend(retries = 30) {
  return new Promise((resolve, reject) => {
    const check = () => {
      const request = http.get('http://localhost:5000', (response) => {
        response.resume();
        resolve();
      });

      request.on('error', () => {
        if (retries <= 0) {
          reject(new Error('Backend did not start within the expected time.'));
          return;
        }

        retries--;

        setTimeout(check, 500);
      });

      request.setTimeout(1000, () => {
        request.destroy();
      });
    };

    check();
  });
}

function stopBackend() {
  if (!backendProcess || backendProcess.killed) {
    return;
  }

  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${backendProcess.pid} /T /F`);
    } else {
      backendProcess.kill();
    }
  } catch (error) {
    console.error('Failed to stop backend:', error);
  } finally {
    backendProcess = null;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, '..', 'dist', 'customer-billing-ui', 'browser', 'index.html'));
}

app.whenReady().then(async () => {
  try {
    console.log('Starting backend...');

    await startBackend();

    console.log('Backend is ready.');

    createWindow();
  } catch (error) {
    console.error('Application startup failed:', error);
    app.quit();
    return;
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopBackend();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});
