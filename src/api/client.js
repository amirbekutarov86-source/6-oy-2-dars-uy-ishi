/**
 * API bilan ishlashning markaziy joyi.
 *
 * Backend barcha javoblarni bir xil formatda qaytaradi:
 *   Muvaffaqiyat:  { success: true, data: ..., meta?: { page, limit, total, totalPages } }
 *   Xato:          { success: false, statusCode, message, errors?, path, timestamp }
 *
 * Shu fayl o'sha o'ramni ochib beradi, ya'ni sahifalar `data` ni to'g'ridan-to'g'ri oladi.
 */

// Vite env o'zgaruvchisi (.env faylidan). Oxiridagi "/" olib tashlanadi.
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

const TOKEN_KEY = 'blog_access_token';

// ===== Token localStorage'da saqlanadi =====
// Sahifa yangilanganda ham foydalanuvchi tizimda qolishi uchun.

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * API xatosi. Oddiy Error'dan farqi — status kodi va maydon xatolari bor.
 *
 * `fieldErrors` — backend validatsiyasidan kelgan xatolar, masalan:
 *   { email: ['email must be an email'], password: ['...'] }
 * Formalar shu obyektdan foydalanib, har bir input tagida xatoni ko'rsatadi.
 */
export class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Har qanday so'rov shu funksiya orqali o'tadi.
 *
 * @param {string} path      - "/posts" kabi yo'l (BASE_URL avtomatik qo'shiladi)
 * @param {object} options
 * @param {string} options.method - GET | POST | PATCH | DELETE
 * @param {object} options.body   - JSON tanasi (FormData bo'lsa `formData` ishlating)
 * @param {FormData} options.formData - fayl yuklash uchun
 * @param {object} options.params - query parametrlari: { page: 1, search: 'nest' }
 * @param {boolean} options.auth  - token qo'shilsinmi (default: true)
 *
 * @returns {Promise<{ data: any, meta: object|null }>}
 */
async function request(path, options = {}) {
  const { method = 'GET', body, formData, params, auth = true } = options;

  // Query parametrlarini yig'ish. undefined/null/'' qiymatlar tashlab yuboriladi,
  // shunda bo'sh filtrlar URL'ni kir qilmaydi.
  const url = new URL(BASE_URL + path);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  const headers = {};

  // Token bor bo'lsa, har bir so'rovga Authorization sarlavhasini qo'shamiz.
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  // MUHIM: FormData yuborayotganda Content-Type NI QO'LDA QO'YMAYMIZ.
  // Brauzer uni o'zi multipart/form-data va kerakli "boundary" bilan to'ldiradi.
  if (body && !formData) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: formData ?? (body ? JSON.stringify(body) : undefined),
    });
  } catch(error) {
    console.log(error);
    
    // fetch faqat tarmoq uzilganda xato beradi (404/500 da emas).
    throw new ApiError('Serverga ulanib bo\'lmadi. Internetni yoki backendni tekshiring.', 0);
  }

  // 204 No Content — tanasi yo'q javob.
  if (response.status === 204) {
    return { data: null, meta: null };
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError('Serverdan noto\'g\'ri javob keldi', response.status);
  }

  if (!response.ok) {
    // Backend maydon xatolarini shunday qaytaradi:
    //   errors: [{ field: 'email', messages: ['email must be an email'] }]
    // Biz uni formalarga qulay obyektga aylantiramiz: { email: ['...'] }
    const fieldErrors = {};
    if (Array.isArray(payload?.errors)) {
      payload.errors.forEach((item) => {
        fieldErrors[item.field] = item.messages;
      });
    }

    // 401 — token yaroqsiz yoki muddati tugagan. Tokenni tozalaymiz,
    // AuthContext buni sezib foydalanuvchini login sahifasiga yuboradi.
    if (response.status === 401 && getToken()) {
      clearToken();
    }

    throw new ApiError(payload?.message || 'Nimadir noto\'g\'ri ketdi', response.status, fieldErrors);
  }

  // Muvaffaqiyatli javobdan o'ramni olib tashlaymiz.
  return { data: payload.data, meta: payload.meta ?? null };
}

// Qisqa yordamchilar — sahifalarda `api.get('/posts')` deb yozish qulayroq.
export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, options) => request(path, { ...options, method: 'POST' }),
  patch: (path, options) => request(path, { ...options, method: 'PATCH' }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
