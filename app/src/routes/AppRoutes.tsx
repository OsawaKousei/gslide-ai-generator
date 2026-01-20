import { Routes, Route, Navigate } from 'react-router-dom';
import { MainPage } from '@/features/generator/pages/MainPage';
import { ModeSelectorWidget } from '@/features/home';
import { MainLayout } from '@/components/layouts/MainLayout';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<ModeSelectorWidget />} />
        <Route path="/create/template" element={<MainPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
