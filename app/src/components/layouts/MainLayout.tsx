import { Outlet } from 'react-router-dom';
import { AuthHeaderWidget } from '@/features/auth/widgets/AuthHeaderWidget';

export const MainLayout = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50">
      <header className="flex-none z-50 shadow-sm relative">
        <AuthHeaderWidget />
      </header>
      <main className="flex-1 overflow-hidden relative flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};
