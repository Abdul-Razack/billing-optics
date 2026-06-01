const { ipcRenderer, shell } = require('electron');

ipcRenderer.on('error-details', (event, errorMsg, logsPath) => {
  document.getElementById('error-text').innerText = errorMsg;
  document.getElementById('logsBtn').dataset.path = logsPath;
});

document.getElementById('retryBtn').addEventListener('click', () => {
  ipcRenderer.send('retry-startup');
});

document.getElementById('logsBtn').addEventListener('click', () => {
  const path = document.getElementById('logsBtn').dataset.path;
  if (path) shell.openPath(path);
});

document.getElementById('resetBtn').addEventListener('click', () => {
  ipcRenderer.send('reset-setup');
});
