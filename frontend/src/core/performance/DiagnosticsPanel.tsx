/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNetworkStore } from '../store/network.store';
import { mutationQueue } from '../queue/mutation.queue';

export default function DiagnosticsPanel(): JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({
    activeQueries: 0,
    queueSize: 0,
    memoryUsed: 0,
  });
  const queryClient = useQueryClient();
  const isOnline = useNetworkStore((state) => state.isOnline);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    const interval = setInterval(async () => {
      const activeQueries = queryClient.getQueryCache().findAll({ type: 'active' }).length;
      const queue = await mutationQueue.getQueue();
      const memory = (performance as any).memory;
      const memoryUsed = memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0;
      
      setStats({
        activeQueries,
        queueSize: queue.length,
        memoryUsed,
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [queryClient]);

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          zIndex: 10000,
          padding: '8px',
          backgroundColor: '#1e293b',
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        DEV
      </button>
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '50px',
          left: '16px',
          zIndex: 10000,
          padding: '16px',
          backgroundColor: '#1e293b',
          color: 'white',
          borderRadius: '8px',
          fontSize: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '250px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}>
          <h3 style={{ margin: 0, color: '#94a3b8' }}>Diagnostics</h3>
          <div><strong>Active Queries:</strong> {stats.activeQueries}</div>
          <div><strong>Pending Mutations:</strong> {stats.queueSize}</div>
          <div><strong>SSE Network:</strong> {isOnline ? 'Connected' : 'Disconnected'}</div>
          <div><strong>Heap Size:</strong> {stats.memoryUsed} MB {stats.memoryUsed > 100 ? '⚠️' : ''}</div>
          <button onClick={() => setIsOpen(false)} style={{ marginTop: '8px', cursor: 'pointer' }}>Close</button>
        </div>
      )}
    </>
  );
}
