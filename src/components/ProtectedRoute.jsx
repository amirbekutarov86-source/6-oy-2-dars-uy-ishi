import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './ui';

/**
 * Himoyalangan sahifalar uchun o'ram.
 *
 * `superadminOnly` bo'lsa, oddiy foydalanuvchi bosh sahifaga qaytariladi.
 * Backend ham buni tekshiradi (403 qaytaradi) — bu yerdagi tekshiruv
 * faqat interfeys qulayligi uchun, xavfsizlik chorasi emas.
 */
export default function ProtectedRoute({ children, superadminOnly = false }) {
  const { status, isAuthenticated, isSuperadmin } = useAuth();
  const location = useLocation();

  // Token hali tekshirilmoqda — sahifani almashtirmay kutamiz.
  if (status === 'loading') return <PageLoader />;

  if (!isAuthenticated) {
    // Kirgandan keyin foydalanuvchi shu sahifaga qaytishi uchun manzilni saqlaymiz.
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (superadminOnly && !isSuperadmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
