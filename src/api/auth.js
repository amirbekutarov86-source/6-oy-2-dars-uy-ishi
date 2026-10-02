import { api } from './client';

/**
 * Auth endpointlari.
 * Har bir funksiya API javobidagi `data` ni qaytaradi.
 */

// POST /auth/register -> { user, accessToken }
export async function register({ username, email, password }) {
  const { data } = await api.post('/auth/register', {
    body: { username, email, password },
    auth: false, // token hali yo'q
  });
  return data;
}

// POST /auth/login -> { user, accessToken }
// `login` maydoniga email ham, username ham yozish mumkin.
export async function login({ login: loginValue, password }) {
  const { data } = await api.post('/auth/login', {
    body: { login: loginValue, password },
    auth: false,
  });
  return data;
}

// POST /auth/logout -> { message }
// Backend tokenning jti sini "revoked_tokens" jadvaliga yozadi,
// shuning uchun chiqish haqiqiy: eski token boshqa ishlamaydi.
export async function logout() {
  const { data } = await api.post('/auth/logout');
  return data;
}

// GET /auth/me -> user
export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data;
}
