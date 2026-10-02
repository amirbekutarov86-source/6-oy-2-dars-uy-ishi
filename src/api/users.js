import { api } from './client';

/** Foydalanuvchi profili va superadmin amallari. */

// GET /users/me
export async function getProfile() {
  const { data } = await api.get('/users/me');
  return data;
}

// PATCH /users/me — username, email, bio
export async function updateProfile(values) {
  const { data } = await api.patch('/users/me', { body: values });
  return data;
}

// PATCH /users/me/password
export async function changePassword({ currentPassword, newPassword }) {
  const { data } = await api.patch('/users/me/password', {
    body: { currentPassword, newPassword },
  });
  return data;
}

// PATCH /users/me/avatar — multipart, maydon nomi "avatar"
// Eski avatar backend tomonidan diskdan avtomatik o'chiriladi.
export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await api.patch('/users/me/avatar', { formData });
  return data;
}

// DELETE /users/me/avatar
export async function deleteAvatar() {
  const { data } = await api.delete('/users/me/avatar');
  return data;
}

// GET /users/:id — ommaviy profil (email ko'rsatilmaydi, postsCount bor)
export async function getPublicProfile(id) {
  const { data } = await api.get(`/users/${id}`, { auth: false });
  return data;
}

// ===== Faqat superadmin uchun =====

// GET /users?page=&limit=&search=&role=
export async function listUsers(filters = {}) {
  const { data, meta } = await api.get('/users', { params: filters });
  return { items: data, meta };
}

// PATCH /users/:id/role — superadmin o'z rolini o'zgartira olmaydi (backend 403 qaytaradi)
export async function changeUserRole(id, role) {
  const { data } = await api.patch(`/users/${id}/role`, { body: { role } });
  return data;
}

// DELETE /users/:id — foydalanuvchi, postlari va fayllari o'chadi
export async function deleteUser(id) {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}
