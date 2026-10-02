import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteTag, listTags, updateTag } from '../../api/tags';
import { useToast } from '../../context/ToastContext';
import AdminTabs from './AdminTabs';
import { Button, EmptyState, ErrorBox, Input, PageLoader } from '../../components/ui';

/**
 * Superadmin: teglarni tahrirlash va o'chirish.
 *
 * PATCH  /tags/:id — nomni o'zgartirish (slug ham qayta hosil bo'ladi)
 * DELETE /tags/:id — tegni o'chirish (postlar o'chmaydi, faqat bog'lanish uziladi)
 */
export default function AdminTagsPage() {
  const { showToast } = useToast();

  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Qaysi teg tahrirlanayotgani va yangi nomi.
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [busyId, setBusyId] = useState(null);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTags(await listTags(search.trim() || undefined));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchTags, 400);
    return () => clearTimeout(timer);
  }, [fetchTags]);

  function startEditing(tag) {
    setEditingId(tag.id);
    setEditValue(tag.name);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditValue('');
  }

  async function handleSave(tag) {
    const name = editValue.trim().toLowerCase();

    if (name === tag.name) {
      cancelEditing();
      return;
    }
    if (name.length < 2 || name.length > 30) {
      showToast('Teg nomi 2–30 belgi bo\'lishi kerak', 'error');
      return;
    }

    setBusyId(tag.id);
    try {
      await updateTag(tag.id, name);
      showToast('Teg yangilandi');
      cancelEditing();
      fetchTags();
    } catch (err) {
      // 409 — bunday nomli teg allaqachon bor.
      showToast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(tag) {
    if (
      !window.confirm(
        `"#${tag.name}" tegini o'chirasizmi?\n\nPostlar o'chmaydi, faqat ushbu teg ulardan olib tashlanadi.`,
      )
    ) {
      return;
    }

    setBusyId(tag.id);
    try {
      await deleteTag(tag.id);
      showToast('Teg o\'chirildi');
      fetchTags();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Admin panel</h1>
      <AdminTabs />

      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <Input
          label="Qidirish"
          placeholder="Teg nomi"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <PageLoader />}
      {!loading && error && <ErrorBox message={error} onRetry={fetchTags} />}

      {!loading && !error && tags.length === 0 && (
        <EmptyState title="Teg topilmadi" description="Teglar postlar yaratilganda hosil bo'ladi." />
      )}

      {!loading && !error && tags.length > 0 && (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          {tags.map((tag) => (
            <div key={tag.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              {editingId === tag.id ? (
                <>
                  <div className="flex-1">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave(tag);
                        if (e.key === 'Escape') cancelEditing();
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button loading={busyId === tag.id} onClick={() => handleSave(tag)}>
                      Saqlash
                    </Button>
                    <Button variant="secondary" onClick={cancelEditing}>
                      Bekor qilish
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/tags/${tag.slug}`}
                      className="font-medium text-slate-800 hover:text-indigo-600"
                    >
                      #{tag.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">
                      slug: {tag.slug} · {tag.postsCount} ta post
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => startEditing(tag)}>
                      Tahrirlash
                    </Button>
                    <Button
                      variant="danger"
                      loading={busyId === tag.id}
                      onClick={() => handleDelete(tag)}
                    >
                      O'chirish
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
