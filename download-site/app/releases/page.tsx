import React from 'react';
import Link from 'next/link';
import { getReleases } from '../../services/github';
import { FileText, Calendar, Tag, ArrowRight, List, Info, ChevronRight } from 'lucide-react';

export default async function ReleaseNotesPage() {
  const { releases, isMocked } = await getReleases();

  // Helper to custom-parse simple markdown headers, list markers, and bold strings
  function renderMarkdown(md: string) {
    if (!md) return '<p class="italic text-slate-400">No release details recorded.</p>';
    
    return md
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        
        // Headers
        if (trimmed.startsWith('## ')) {
          return `<h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mt-6 mb-3 border-b border-slate-200 dark:border-slate-800 pb-1.5">${trimmed.substring(3)}</h3>`;
        }
        if (trimmed.startsWith('### ')) {
          return `<h4 class="text-sm font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2 flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>${trimmed.substring(4)}</h4>`;
        }
        
        // Bullet points with bold titles (e.g., "- **Title**: details")
        if (trimmed.startsWith('- ')) {
          const content = trimmed.substring(2);
          const boldMatch = content.match(/^\*\*(.*?)\*\*(.*)/);
          if (boldMatch) {
            return `<li class="ml-4 list-disc my-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed"><strong class="font-bold text-slate-950 dark:text-slate-100">${boldMatch[1]}</strong>${boldMatch[2]}</li>`;
          }
          return `<li class="ml-4 list-disc my-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">${content}</li>`;
        }
        
        // Standard paragraphs
        if (trimmed.length > 0) {
          // Replace simple inline bold markers `**text**` and code markers `code`
          let htmlLine = trimmed
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-slate-100">$1</strong>')
            .replace(/`(.*?)`/g, '<code class="font-mono bg-indigo-500/10 px-1 py-0.5 rounded text-xs text-indigo-600 dark:text-indigo-400">$1</code>');
          return `<p class="text-sm text-slate-600 dark:text-slate-300 my-2 leading-relaxed">${htmlLine}</p>`;
        }
        
        return '';
      })
      .join('');
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in max-w-5xl mx-auto">
      
      {/* Left Column: Jump Index Navigation (Desktop only) */}
      <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-4">
        <div className="glass-panel rounded-2xl p-4 space-y-3">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <List className="h-3.5 w-3.5" />
            Quick Navigation
          </h2>
          <div className="space-y-1">
            {releases.map((release) => (
              <a
                key={release.version}
                href={`#${release.version}`}
                className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100/50 dark:hover:text-indigo-400 dark:hover:bg-slate-900/40 transition-all duration-200"
              >
                <span className="truncate max-w-[120px]">{release.version} ({release.releaseDate})</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </a>
            ))}
          </div>
        </div>
      </aside>

      {/* Right Column: Detailed Release Cards */}
      <div className="col-span-1 lg:col-span-9 space-y-12">
        
        {/* Page Header */}
        <section className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <FileText className="h-8 w-8 text-indigo-500" />
            Release Changelogs
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
            Detailed reports listing updates, security fixes, optimizations, and installer downloads across historical builds of Billing Optics ERP.
          </p>
        </section>

        {isMocked && (
          <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/10 text-amber-800 dark:text-amber-400/90 text-xs flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-amber-500" />
            <span>Notice: Displaying offline release changelog notes. Connect internet to reload current repository registers.</span>
          </div>
        )}

        {/* Release changelog sections */}
        <div className="space-y-8">
          {releases.map((release) => (
            <article
              key={release.version}
              id={release.version}
              className="glass-panel rounded-3xl p-6 sm:p-8 hover:border-indigo-500/15 transition-all duration-300 space-y-6 relative scroll-mt-24"
            >
              {/* Header block */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/80 pb-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      <Tag className="h-4 w-4" />
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                      Release Tag {release.version}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-350 italic font-bold">
                    &ldquo;{release.name}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold self-start sm:self-auto bg-slate-100 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/60">
                  <Calendar className="h-3.5 w-3.5 text-indigo-500/50" />
                  <span>Published: {release.releaseDate}</span>
                </div>
              </div>

              {/* Parsed Markdown Notes Body */}
              <div 
                className="markdown-content text-slate-600 dark:text-slate-300"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(release.releaseNotes) }}
              />

              {/* Footer Downloads Action Pills */}
              <div className="pt-5 border-t border-slate-200/60 dark:border-slate-800/85 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-400 font-semibold">
                  * Read instructions before running this setup packet.
                </div>
                
                <div className="flex flex-wrap gap-2.5">
                  {release.windowsAsset && (
                    <a
                      href={release.windowsAsset.url}
                      className="px-4 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 hover:text-white dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500 dark:hover:text-white transition-all text-xs font-bold border border-indigo-500/10 flex items-center gap-1.5 shadow-sm"
                    >
                      Windows Setup ({release.windowsAsset.size})
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  )}
                  {release.linuxAssetDeb && (
                    <a
                      href={release.linuxAssetDeb.url}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-all text-xs font-bold border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 shadow-sm"
                    >
                      Debian Pack ({release.linuxAssetDeb.size})
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

            </article>
          ))}
        </div>

      </div>
      
    </div>
  );
}
