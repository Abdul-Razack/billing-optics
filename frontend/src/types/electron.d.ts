export interface ElectronAPI {
  checkForUpdates: () => Promise<{ success: boolean; result?: any; error?: string }>;
  installUpdate: () => Promise<void>;
  
  onUpdateAvailable: (callback: () => void) => () => void;
  onUpdateProgress: (callback: (progress: any) => void) => () => void;
  onUpdateReady: (callback: () => void) => () => void;
  onUpdateError: (callback: (error: string) => void) => () => void;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
