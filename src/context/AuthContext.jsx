import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import * as authApi from '../api/auth';
import { clearToken, getToken, setToken } from '../api/client';

/**
 * Autentifikatsiya holati — Redux o'rniga useReducer + useContext.
 *
 * Nega useReducer? Chunki holat o'zgarishlari bir nechta maydonga tegadi
 * (user + status + xato), va ularni bitta joyda, aniq "action" lar orqali
 * boshqarish useState'lar to'plamidan tartibliroq.
 */

const AuthContext = createContext(null);

// status: 'loading'  — token tekshirilyapti (sahifa endi ochildi)
//         'authenticated' — foydalanuvchi tizimda
//         'guest'    — tizimga kirilmagan
const initialState = {
  user: null,
  status: 'loading',
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      // Login, register yoki sahifa ochilganda /auth/me muvaffaqiyatli bo'ldi.
      return { user: action.payload, status: 'authenticated' };

    case 'AUTH_GUEST':
      // Token yo'q yoki yaroqsiz.
      return { user: null, status: 'guest' };

    case 'USER_UPDATED':
      // Profil tahrirlandi yoki avatar o'zgardi — foydalanuvchi ma'lumotini yangilaymiz.
      return { ...state, user: action.payload };

    default:
      throw new Error(`Noma'lum action: ${action.type}`);
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Sahifa birinchi ochilganda: localStorage'da token bo'lsa, u hali
  // yaroqli ekanini /auth/me orqali tekshiramiz. Token bekor qilingan
  // yoki muddati tugagan bo'lsa, backend 401 qaytaradi.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!getToken()) {
        dispatch({ type: 'AUTH_GUEST' });
        return;
      }
      try {
        const user = await authApi.getMe();
        if (!cancelled) dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } catch {
        clearToken();
        if (!cancelled) dispatch({ type: 'AUTH_GUEST' });
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const { user, accessToken } = await authApi.login(credentials);
    setToken(accessToken);
    dispatch({ type: 'AUTH_SUCCESS', payload: user });
    return user;
  }, []);

  const register = useCallback(async (values) => {
    const { user, accessToken } = await authApi.register(values);
    setToken(accessToken);
    dispatch({ type: 'AUTH_SUCCESS', payload: user });
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      // Backendga xabar beramiz — token haqiqatan bekor qilinsin.
      await authApi.logout();
    } catch {
      // Token allaqachon yaroqsiz bo'lsa ham, mahalliy chiqishni davom ettiramiz.
    }
    clearToken();
    dispatch({ type: 'AUTH_GUEST' });
  }, []);

  // Profil o'zgarganda (bio, avatar, username) navbar ham yangilanishi uchun.
  const setUser = useCallback((user) => {
    dispatch({ type: 'USER_UPDATED', payload: user });
  }, []);

  const value = {
    user: state.user,
    status: state.status,
    isAuthenticated: state.status === 'authenticated',
    isSuperadmin: state.user?.role === 'superadmin',
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Komponentlarda ishlatish uchun: const { user, logout } = useAuth(); */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth faqat <AuthProvider> ichida ishlatiladi');
  }
  return context;
}
