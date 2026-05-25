import { useState, useEffect } from 'react';

export default function ShortcutOverlay(): JSX.Element | null {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with F1 or ? (Shift + /)
      if (e.key === 'F1' || (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName))) {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsVisible(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center animate-in fade-in duration-200 backdrop-blur-sm" onClick={() => setIsVisible(false)}>
      <div className="bg-white rounded-2xl w-[500px] shadow-2xl p-8 border border-slate-100 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Keyboard Shortcuts</h2>
          <button onClick={() => setIsVisible(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <ShortcutItem keys={["CTRL", "K"]} description="Open Command Palette" />
          <ShortcutItem keys={["CTRL", "ENTER"]} description="Confirm Payment / Checkout" />
          <ShortcutItem keys={["ESC"]} description="Close Modal / Cancel Input" />
          <ShortcutItem keys={["UP", "DOWN"]} description="Navigate Search Results" />
          <ShortcutItem keys={["ENTER"]} description="Add Selected to Cart" />
          <ShortcutItem keys={["F1"]} description="Show this help menu" />
        </div>
      </div>
    </div>
  );
}

function ShortcutItem({ keys, description }: { keys: string[], description: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-slate-600 font-medium">{description}</span>
      <div className="flex gap-2">
        {keys.map((k, i) => (
          <kbd key={i} className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-xs font-mono font-semibold text-slate-700 shadow-sm">
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}
