import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { GlobalNotificationWidget } from '@/features/global-notification';

export const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <AppRoutes />
        <GlobalNotificationWidget />
      </Suspense>
    </BrowserRouter>
  );
};
