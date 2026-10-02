import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MyPostsPage from './pages/MyPostsPage';
import NotFoundPage from './pages/NotFoundPage';
import PostDetailPage from './pages/PostDetailPage';
import PostFormPage from './pages/PostFormPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import RegisterPage from './pages/RegisterPage';
import TagPostsPage from './pages/TagPostsPage';
import TagsPage from './pages/TagsPage';
import AdminTagsPage from './pages/admin/AdminTagsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

/**
 * Ilovaning ildizi.
 *
 * Provider'lar tartibi muhim:
 *   ToastProvider tashqarida — AuthProvider ham xabar ko'rsata olishi uchun emas,
 *   balki barcha sahifalar `useToast` ga kira olishi uchun.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen">
            <Navbar />

            <main className="mx-auto max-w-6xl px-4 py-8">
              <Routes>
                {/* ===== Ommaviy sahifalar ===== */}
                <Route path="/" element={<HomePage />} />
                <Route path="/posts/:id" element={<PostDetailPage />} />
                <Route path="/tags" element={<TagsPage />} />
                <Route path="/tags/:slug" element={<TagPostsPage />} />
                <Route path="/users/:id" element={<PublicProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* ===== Token talab qiladigan sahifalar ===== */}
                <Route
                  path="/posts/new"
                  element={
                    <ProtectedRoute>
                      <PostFormPage mode="create" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/posts/:id/edit"
                  element={
                    <ProtectedRoute>
                      <PostFormPage mode="edit" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-posts"
                  element={
                    <ProtectedRoute>
                      <MyPostsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* ===== Faqat superadmin ===== */}
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute superadminOnly>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/tags"
                  element={
                    <ProtectedRoute superadminOnly>
                      <AdminTagsPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            <footer className="border-t border-slate-200 bg-white py-6">
              <p className="text-center text-sm text-slate-500">
                Blog · NestJS API + React frontend
              </p>
            </footer>
          </div>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
