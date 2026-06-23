import React from 'react';
import Link from 'next/link';
import { getReleases } from '../../services/github';
import { History, Calendar, Download, AlertTriangle, Monitor, Terminal, ChevronRight, Info } from 'lucide-react';

export default async function VersionHistory() {
  const { releases, isMocked } = await getReleases();

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      
      {/* Page Header */}
      <section className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <History className="h-8 w-8 text-indigo-500" />
          Version History
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
          Chronological record of all compiled desktop installer packages. Trace improvements, security enhancements, and changes across stable and beta branches.
        </p>
      </section>

      {/* API diagnostics pill */}
      {isMocked && (
        <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/10 text-amber-800 dark:text-amber-400/90 text-xs flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0 text-amber-500" />
          <span>Note: Running in offline fallback mode. Displaying pre-compiled release repository history for validation.</span>
        </div>
      )}

      {/* History Timeline */}
      {releases && releases.length > 0 ? (
        <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 sm:ml-6 space-y-12 py-4">
          {releases.map((release, idx) => {
            const hasDownloads = !!(release.windowsAsset || release.linuxAssetAppImage);
            
            return (
              <div key={release.version} className="relative pl-8 sm:pl-10 group">
                
                {/* Timeline Node Point */}
                <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-indigo-500 bg-white dark:bg-slate-950 group-hover:scale-110 group-hover:bg-indigo-500 transition-all duration-300 shadow-sm" />

                {/* Release Card */}
                <div className="glass-panel rounded-3xl p-6 hover:border-indigo-500/20 transition-all duration-300 space-y-5">
                  
                  {/* Top Release Metadata Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        Release {release.version}
                      </h2>
                      {release.isPrerelease ? (
                        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15 rounded-md uppercase">
                          Pre-Release
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 rounded-md uppercase">
                          Stable Release
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-xs text-slate-400 font-semibold gap-1.5">
                      <Calendar className="h-4 w-4 text-indigo-500/40" />
                      <span>{release.releaseDate}</span>
                    </div>
                  </div>

                  {/* Title / Name */}
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic">
                    &ldquo;{release.name}&rdquo;
                  </p>

                  {/* Dynamic Installer Downloads Section */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Platform Installer Packages
                    </h3>
                    
                    {hasDownloads ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        
                        {/* Windows Installer */}
                        {release.windowsAsset && (
                          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 hover:border-indigo-500/15 hover:bg-white/60 dark:hover:bg-slate-900/50 transition-all duration-300">
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <Monitor className="h-4 w-4 text-indigo-500 shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={release.windowsAsset.name}>
                                  {release.windowsAsset.name}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-400">Windows Setup ({release.windowsAsset.size})</span>
                              </div>
                            </div>
                            <a
                              href={release.windowsAsset.url}
                              className="p-2 rounded-xl bg-indigo-600/5 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500 dark:hover:text-white transition-all shadow-sm shrink-0"
                              title="Download package"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        )}


                        {/* Linux AppImage */}
                        {release.linuxAssetAppImage && (
                          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 hover:border-emerald-500/15 hover:bg-white/60 dark:hover:bg-slate-900/50 transition-all duration-300 sm:col-span-2">
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <Terminal className="h-4 w-4 text-emerald-500 shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={release.linuxAssetAppImage.name}>
                                  {release.linuxAssetAppImage.name}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-400">Universal AppImage ({release.linuxAssetAppImage.size})</span>
                              </div>
                            </div>
                            <a
                              href={release.linuxAssetAppImage.url}
                              className="p-2 rounded-xl bg-emerald-600/5 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white transition-all shadow-sm shrink-0"
                              title="Download package"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        )}

                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-semibold italic">No direct installer assets compiled for this release tag.</p>
                    )}
                  </div>

                  {/* Link to view expand changelog */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-end">
                    <Link
                      href={`/releases#${release.version}`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-0.5 hover:underline"
                    >
                      Read detailed changes
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <section className="text-center py-16 glass-panel rounded-3xl p-8 border-dashed border-2">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Historical Registers Empty</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            No public versions are registered. Please tag commits or push release notes to compile and showcase version lists.
          </p>
        </section>
      )}

    </div>
  );
}
