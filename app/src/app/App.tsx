import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';

export const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
};
