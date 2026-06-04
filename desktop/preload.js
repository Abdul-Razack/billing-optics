const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Update system
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  
  // Event listeners
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', callback);
    return () => ipcRenderer.removeListener('update-available', callback);
  },
  onUpdateProgress: (callback) => {
    ipcRenderer.on('download-progress', (event, progressObj) => callback(progressObj));
    return () => ipcRenderer.removeListener('download-progress', callback);
  },
  onUpdateReady: (callback) => {
    ipcRenderer.on('update-downloaded', callback);
    return () => ipcRenderer.removeListener('update-downloaded', callback);
  },
  onUpdateError: (callback) => {
    ipcRenderer.on('update-error', (event, error) => callback(error));
    return () => ipcRenderer.removeListener('update-error', callback);
  },
  
  // Backend Management
  restartBackend: () => ipcRenderer.send('restart-backend'),
  onBackendStatus: (callback) => {
    ipcRenderer.on('backend-status', (event, data) => callback(data));
    return () => ipcRenderer.removeListener('backend-status', callback);
  },
  onBackendCrashReport: (callback) => {
    ipcRenderer.on('backend-crash-report', (event, data) => callback(data));
    return () => ipcRenderer.removeListener('backend-crash-report', callback);
  },
  
  // App Config
  getEnv: () => ipcRenderer.invoke('get-env')
});
