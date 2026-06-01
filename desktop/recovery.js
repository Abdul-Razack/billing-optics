const { ipcRenderer } = require('electron');

let currentConfig = null;
let currentDiagnostic = null;

ipcRenderer.on('recovery-state', (event, diagnosticResult, config) => {
  currentConfig = config;
  currentDiagnostic = diagnosticResult;
  document.getElementById('issue-text').innerText = diagnosticResult.issue;
});

document.getElementById('repairBtn').addEventListener('click', () => {
  if (!currentConfig || !currentDiagnostic) return;

  const btn = document.getElementById('repairBtn');
  const spinner = document.getElementById('repair-spinner');
  
  btn.disabled = true;
  spinner.classList.remove('hidden');
  
  document.getElementById('issue-container').classList.add('hidden');
  document.getElementById('logs-container').classList.remove('hidden');
  document.getElementById('logs-container').classList.add('flex');
  
  ipcRenderer.send('run-repair', currentConfig, currentDiagnostic);
});

document.getElementById('diagnosticsBtn').addEventListener('click', () => {
  document.getElementById('issue-container').classList.add('hidden');
  document.getElementById('logs-container').classList.remove('hidden');
  document.getElementById('logs-container').classList.add('flex');
  
  const logOut = document.getElementById('log-output');
  logOut.value += `[DIAGNOSTICS]\n${JSON.stringify(currentDiagnostic, null, 2)}\n\n`;
});

ipcRenderer.on('repair-log', (event, msg) => {
  const logOut = document.getElementById('log-output');
  logOut.value += `> ${msg}\n`;
  logOut.scrollTop = logOut.scrollHeight;
});

ipcRenderer.on('repair-success', (event, fullLogs) => {
  setTimeout(() => {
    document.getElementById('logs-container').classList.add('hidden');
    document.getElementById('logs-container').classList.remove('flex');
    document.getElementById('success-container').classList.remove('hidden');
    document.getElementById('success-container').classList.add('flex');
  }, 1000);
});

ipcRenderer.on('repair-failed', (event, errorMsg) => {
  const btn = document.getElementById('repairBtn');
  const spinner = document.getElementById('repair-spinner');
  
  btn.disabled = false;
  spinner.classList.add('hidden');
  
  const logOut = document.getElementById('log-output');
  logOut.value += `\n[ERROR] Repair failed: ${errorMsg}\n`;
  logOut.scrollTop = logOut.scrollHeight;
});

document.getElementById('restartBtn').addEventListener('click', () => {
  ipcRenderer.send('recovery-restart');
});
