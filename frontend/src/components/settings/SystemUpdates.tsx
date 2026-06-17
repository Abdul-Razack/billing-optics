"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function SystemUpdates() {
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "downloading" | "ready" | "error">("idle");
  const [versionInfo, setVersionInfo] = useState<{ current: string; latest?: string }>({ current: "1.0.0" });
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // Determine if we are in desktop or need to use a mock for the web browser demo
  const isActualDesktop = typeof window !== "undefined" && !!(window as any).electron?.checkForUpdates;
  const isDesktop = typeof window !== "undefined"; // Allow it to run in browser via mock

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Inject a mock electron updater if we're in the browser to demo the functionality
    if (!isActualDesktop && !(window as any).electron) {
      const listeners = {} as Record<string, any>;
      (window as any).electron = {
        onUpdateAvailable: (cb: any) => { listeners.available = cb; return () => {}; },
        onUpdateProgress: (cb: any) => { listeners.progress = cb; return () => {}; },
        onUpdateReady: (cb: any) => { listeners.downloaded = cb; return () => {}; },
        onUpdateError: (cb: any) => { listeners.error = cb; return () => {}; },
        checkForUpdates: async () => {
          setTimeout(() => {
            if (listeners.available) listeners.available({ version: "1.1.0" });
            
            // Auto start download simulation
            let p = 0;
            const int = setInterval(() => {
              p += 10;
              if (listeners.progress) listeners.progress({ percent: p });
              if (p >= 100) {
                clearInterval(int);
                setTimeout(() => {
                  if (listeners.downloaded) listeners.downloaded();
                }, 500);
              }
            }, 300);
          }, 1500);
          return { success: true };
        },
        installUpdate: () => {
          toast.success("Mock: Restarting application...");
          setTimeout(() => window.location.reload(), 1500);
        }
      };
    }
  }, [isActualDesktop]);

  useEffect(() => {
    if (!isDesktop) return;

    const electron = (window as any).electron;
    if (!electron || !electron.onUpdateAvailable) return;

    const handleAvailable = (info: any) => {
      setStatus("available");
      setVersionInfo(prev => ({ ...prev, latest: info?.version || "New Version" }));
      toast.success("A new update is available! Downloading...");
    };

    const handleProgress = (prog: any) => {
      setStatus("downloading");
      setProgress(prog?.percent ? Math.round(prog.percent) : 0);
    };

    const handleDownloaded = () => {
      setStatus("ready");
      toast.success("Update downloaded and ready to install.");
    };

    const handleError = (err: string) => {
      setStatus("error");
      setErrorMessage(typeof err === 'string' ? err : "Failed to download update.");
      toast.error("Update failed.");
    };

    const cleanup1 = electron.onUpdateAvailable(handleAvailable);
    const cleanup2 = electron.onUpdateProgress(handleProgress);
    const cleanup3 = electron.onUpdateReady(handleDownloaded);
    const cleanup4 = electron.onUpdateError(handleError);

    return () => {
      if (cleanup1) cleanup1();
      if (cleanup2) cleanup2();
      if (cleanup3) cleanup3();
      if (cleanup4) cleanup4();
    };
  }, [isDesktop]);

  const checkUpdates = async () => {
    if (!isDesktop) return;
    try {
      setStatus("checking");
      const result = await (window as any).electron.checkForUpdates();
      
      if (result && result.success === false) {
        setStatus("error");
        setErrorMessage(result.error || "Update check failed.");
        return;
      }
      
      // If success is true, but we don't have an onUpdateNotAvailable listener,
      // we'll just reset to idle after a few seconds if no "available" event fired.
      setTimeout(() => {
        setStatus(prev => prev === "checking" ? "idle" : prev);
      }, 5000);
      
    } catch (error) {
      setStatus("error");
      setErrorMessage("Failed to reach update servers.");
    }
  };

  const installUpdate = () => {
    if (!isDesktop) return;
    (window as any).electron.installUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="font-semibold leading-none tracking-tight mb-2">Software Updates</h3>
        <p className="text-sm text-muted-foreground mb-6">Manage system updates for Billing Optics ERP.</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <span className="text-muted-foreground block mb-1">Current Version</span>
            <span className="font-medium text-lg">v{versionInfo.current}</span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-1">Latest Version</span>
            <span className="font-medium text-lg">
              {status === "available" || status === "ready" || status === "downloading" ? `v${versionInfo.latest}` : "Up to date"}
            </span>
          </div>
          <div className="col-span-2 mt-2">
            <span className="text-muted-foreground block mb-1">Update Channel</span>
            <span className="font-medium px-2 py-1 bg-muted rounded-md">Stable (Production)</span>
          </div>
        </div>
        
        <div className="mt-4 pt-6 border-t flex flex-col gap-4">
          {status === "checking" && (
            <div className="flex items-center text-blue-600 gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Checking for updates...</span>
            </div>
          )}

          {status === "available" && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span className="text-sm font-medium">Update v{versionInfo.latest} is available.</span>
              </div>
              <Button size="sm" onClick={() => {
                setStatus("downloading");
                if (isDesktop) (window as any).electron.updater.downloadUpdate();
              }}>
                Download Now
              </Button>
            </div>
          )}

          {status === "downloading" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-blue-600">Downloading update...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          {status === "ready" && (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-md border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Update downloaded and ready to install.</span>
              </div>
              <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={installUpdate}>
                Restart & Install
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          {(status === "idle" || status === "error") && (
            <Button onClick={checkUpdates} variant="outline" className="w-fit" disabled={!isDesktop}>
              <RefreshCw className="mr-2 h-4 w-4" /> Check for Updates
            </Button>
          )}

          {!isDesktop && (
            <p className="text-xs text-orange-600 mt-2">
              * Note: You are accessing the application via a web browser. Automatic updates are only supported in the native Desktop application.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
