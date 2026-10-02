import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Avatar, Button } from './ui';

/** Yuqori navigatsiya paneli. */
export default function Navbar() {
  const { user, isAuthenticated, isSuperadmin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    showToast('Tizimdan chiqdingiz');
    setMenuOpen(false);
    navigate('/');
  }

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-lg font-bold text-indigo-600">
          Blog
        </Link>

        {/* Katta ekranlar uchun menyu */}
        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={linkClass}>
            Postlar
          </NavLink>
          <NavLink to="/tags" className={linkClass}>
            Teglar
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/my-posts" className={linkClass}>
              Mening postlarim
            </NavLink>
          )}
          {isSuperadmin && (
            <NavLink to="/admin/users" className={linkClass}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/posts/new" className="hidden sm:block">
                <Button>Yangi post</Button>
              </Link>
              <Link to="/profile" className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100">
                <Avatar src={user?.avatar} name={user?.username} size="sm" />
                <span className="hidden text-sm font-medium text-slate-700 lg:block">
                  {user?.username}
                </span>
              </Link>
              <Button variant="ghost" onClick={handleLogout} className="hidden sm:inline-flex">
                Chiqish
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="secondary">Kirish</Button>
              </Link>
              <Link to="/register" className="hidden sm:block">
                <Button>Ro'yxatdan o'tish</Button>
              </Link>
            </>
          )}

          {/* Kichik ekranlar uchun menyu tugmasi */}
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Menyu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Kichik ekranlar uchun ochiladigan menyu */}
      {menuOpen && (
        <div className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 md:hidden">
          <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>
            Postlar
          </NavLink>
          <NavLink to="/tags" className={linkClass} onClick={() => setMenuOpen(false)}>
            Teglar
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/my-posts" className={linkClass} onClick={() => setMenuOpen(false)}>
                Mening postlarim
              </NavLink>
              <NavLink to="/posts/new" className={linkClass} onClick={() => setMenuOpen(false)}>
                Yangi post
              </NavLink>
            </>
          )}
          {isSuperadmin && (
            <NavLink to="/admin/users" className={linkClass} onClick={() => setMenuOpen(false)}>
              Admin panel
            </NavLink>
          )}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Chiqish
            </button>
          ) : (
            <NavLink to="/register" className={linkClass} onClick={() => setMenuOpen(false)}>
              Ro'yxatdan o'tish
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
}
