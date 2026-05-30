const { ipcRenderer } = require('electron');

document.getElementById('configForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const dbUrl = document.getElementById('dbUrl').value;
  const port = document.getElementById('port').value;

  ipcRenderer.send('save-config', { dbUrl, port });
});

document.getElementById('quitBtn').addEventListener('click', () => {
  ipcRenderer.send('quit-app');
});
