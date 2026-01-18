import { Routes, Route, Navigate } from 'react-router-dom';
import { GomokuPage } from '@/features/gomoku';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<GomokuPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
