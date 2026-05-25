/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function CommandPalette(): JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const commands = [
    'New Invoice',
    'Suspend Invoice',
    'Resume Invoice',
    'Open Inventory',
    'Open Reports',
    'Logout',
  ];

  const filtered = commands.filter((c) => c.toLowerCase().includes(search.toLowerCase()));

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', paddingTop: '10vh', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', width: '400px', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <input 
          autoFocus 
          placeholder="Search commands..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          style={{ padding: '8px', marginBottom: '16px' }}
        />
        <div>
          {filtered.map((cmd) => (
            <div key={cmd} style={{ padding: '8px', cursor: 'pointer' }} onClick={() => setIsOpen(false)}>
              {cmd}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
