/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import AppProviders from './providers';
import OfflineBanner from '../ui/components/OfflineBanner';
import SyncIndicator from '../ui/components/SyncIndicator';
import { Toaster } from 'react-hot-toast';

export default function App(): JSX.Element {
  return (
    <AppProviders>
      <Toaster position="top-right" />
      <OfflineBanner />
      <RouterProvider router={router} />
      <SyncIndicator />
    </AppProviders>
  );
}
