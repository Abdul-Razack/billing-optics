import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import AppProviders from './providers';
import OfflineBanner from '../ui/components/OfflineBanner';
import SyncIndicator from '../ui/components/SyncIndicator';

export default function App(): JSX.Element {
  return (
    <AppProviders>
      <OfflineBanner />
      <RouterProvider router={router} />
      <SyncIndicator />
    </AppProviders>
  );
}
