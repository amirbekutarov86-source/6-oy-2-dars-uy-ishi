import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listTags } from '../api/tags';
import { EmptyState, ErrorBox, Input, PageLoader } from '../components/ui';

/** Barcha teglar va ularning post soni. */
export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Qidiruv maydoniga yozilganda darhol so'rov yubormaymiz —
  // 400 ms kutamiz (debounce), shunda har bir harf uchun so'rov ketmaydi.
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        setTags(await listTags(search.trim() || undefined));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Teglar</h1>
      <p className="mt-1 mb-6 text-sm text-slate-600">
        Tegni bosib, unga tegishli postlarni ko'ring.
      </p>

      <div className="mb-6">
        <Input
          placeholder="Teg nomi bo'yicha qidirish…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <PageLoader />}
      {!loading && error && <ErrorBox message={error} />}

      {!loading && !error && tags.length === 0 && (
        <EmptyState
          title="Teg topilmadi"
          description={search ? 'Boshqa nom bilan qidirib ko\'ring.' : 'Hozircha teglar yo\'q.'}
        />
      )}

      {!loading && !error && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              to={`/tags/${tag.slug}`}
              className="group flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200 transition hover:ring-indigo-300"
            >
              <span className="font-medium text-slate-800 group-hover:text-indigo-600">
                #{tag.name}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {tag.postsCount}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
