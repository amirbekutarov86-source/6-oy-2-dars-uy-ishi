import { api } from './client';

/** Teglar. Yangi teglar post yaratishda avtomatik hosil bo'ladi. */

// GET /tags?search= -> [{ id, name, slug, postsCount, createdAt }]
export async function listTags(search) {
  const { data } = await api.get('/tags', { params: { search }, auth: false });
  return data;
}

// GET /tags/:slug/posts — teg bo'yicha sahifalangan postlar
export async function listPostsByTag(slug, filters = {}) {
  const { data, meta } = await api.get(`/tags/${slug}/posts`, {
    params: filters,
    auth: false,
  });
  return { items: data, meta };
}

// PATCH /tags/:id — superadmin. Nom o'zgarsa, slug ham qayta hosil bo'ladi.
export async function updateTag(id, name) {
  const { data } = await api.patch(`/tags/${id}`, { body: { name } });
  return data;
}

// DELETE /tags/:id — superadmin
export async function deleteTag(id) {
  const { data } = await api.delete(`/tags/${id}`);
  return data;
}
