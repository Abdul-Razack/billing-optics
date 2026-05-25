/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useNetworkStore } from '../../core/store/network.store';

export default function OfflineBanner(): JSX.Element | null {
  const isOnline = useNetworkStore((state) => state.isOnline);

  if (isOnline) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#ef4444',
      color: 'white',
      textAlign: 'center',
      padding: '4px',
      zIndex: 9999,
      fontWeight: 'bold',
      fontSize: '14px'
    }}>
      You are currently offline. Changes are saved locally and will sync when reconnected.
    </div>
  );
}
