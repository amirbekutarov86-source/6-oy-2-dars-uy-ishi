import { api } from './client';

/**
 * Postlar bilan ishlash.
 *
 * Diqqat: post yaratish va tahrirlash `multipart/form-data` orqali ketadi,
 * chunki rasm fayli ham shu so'rovda yuboriladi.
 */

/**
 * GET /posts — ommaviy ro'yxat, filtrlar bilan.
 * @param {object} filters - { page, limit, search, tag, tags, authorId, sortBy, order }
 * @returns {{ items: array, meta: object }}
 */
export async function listPosts(filters = {}) {
  const { data, meta } = await api.get('/posts', { params: filters, auth: false });
  return { items: data, meta };
}

// GET /posts/my — faqat joriy foydalanuvchining postlari (token kerak).
export async function listMyPosts(filters = {}) {
  const { data, meta } = await api.get('/posts/my', { params: filters });
  return { items: data, meta };
}

// GET /posts/:id
export async function getPost(id) {
  const { data } = await api.get(`/posts/${id}`, { auth: false });
  return data;
}

// GET /posts/slug/:slug
export async function getPostBySlug(slug) {
  const { data } = await api.get(`/posts/slug/${slug}`, { auth: false });
  return data;
}

/**
 * Post ma'lumotlarini FormData'ga yig'ish.
 * Backend teglarni ikki xil ko'rinishda qabul qiladi; biz vergul bilan yuboramiz.
 */
function buildPostFormData({ title, content, tags, image }) {
  const formData = new FormData();
  if (title !== undefined) formData.append('title', title);
  if (content !== undefined) formData.append('content', content);

  // tags — massiv yoki satr bo'lishi mumkin. Backend "nestjs,react" ko'rinishini kutadi.
  if (tags !== undefined) {
    const value = Array.isArray(tags) ? tags.join(',') : tags;
    // Bo'sh satr yuborilsa, backend teglarni bo'shatadi — bu to'g'ri xatti-harakat.
    formData.append('tags', value);
  }

  // Rasm faqat foydalanuvchi yangi fayl tanlagan bo'lsa qo'shiladi.
  if (image) formData.append('image', image);

  return formData;
}

// POST /posts
export async function createPost(values) {
  const { data } = await api.post('/posts', { formData: buildPostFormData(values) });
  return data;
}

// PATCH /posts/:id — faqat egasi yoki superadmin
export async function updatePost(id, values) {
  const { data } = await api.patch(`/posts/${id}`, { formData: buildPostFormData(values) });
  return data;
}

// DELETE /posts/:id — post va uning rasmi o'chadi
export async function deletePost(id) {
  const { data } = await api.delete(`/posts/${id}`);
  return data;
}

// DELETE /posts/:id/image — faqat rasmni o'chirish
export async function deletePostImage(id) {
  const { data } = await api.delete(`/posts/${id}/image`);
  return data;
}
