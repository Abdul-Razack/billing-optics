/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useEffect, useState } from 'react';
import { mutationQueue } from '../../core/queue/mutation.queue';
import { useNetworkStore } from '../../core/store/network.store';

export default function SyncIndicator(): JSX.Element | null {
  const [count, setCount] = useState(0);
  const isOnline = useNetworkStore((state) => state.isOnline);

  useEffect(() => {
    const interval = setInterval(async () => {
      const queue = await mutationQueue.getQueue();
      setCount(queue.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      backgroundColor: isOnline ? '#3b82f6' : '#64748b',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '24px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px'
    }}>
      {isOnline ? (
        <>
          <span className="spinner" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          Syncing {count} pending changes...
        </>
      ) : (
        <>
          <span>{count} pending changes queued</span>
        </>
      )}
      <style>
        {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
}
