import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listPosts } from '../api/posts';
import Pagination from '../components/Pagination';
import PostCard from '../components/PostCard';
import { Button, EmptyState, ErrorBox, Input, PageLoader, Select } from '../components/ui';

/**
 * Bosh sahifa: postlar ro'yxati + qidiruv, teg filtri va saralash.
 *
 * Filtrlar URL query'sida saqlanadi (useSearchParams), shuning uchun
 * sahifani yangilasangiz yoki havolani ulashsangiz filtrlar saqlanib qoladi.
 */
export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL'dan joriy filtrlarni o'qiymiz.
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 10);
  const search = searchParams.get('search') || '';
  const tags = searchParams.get('tags') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'DESC';

  // Qidiruv maydonining "hozirgi" qiymati — foydalanuvchi yozayotgan paytdagi.
  const [searchInput, setSearchInput] = useState(search);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listPosts({ page, limit, search, tags, sortBy, order });
      setPosts(result.items);
      setMeta(result.meta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, tags, sortBy, order]);

  // Filtrlardan biri o'zgarsa, ro'yxat qaytadan yuklanadi.
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  /** Filtrni o'zgartirish — har qanday o'zgarishda 1-sahifaga qaytamiz. */
  function updateFilter(changes) {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('page' in changes)) next.delete('page');
    setSearchParams(next);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    updateFilter({ search: searchInput.trim() });
  }

  function clearFilters() {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  }

  const hasFilters = Boolean(search || tags || searchParams.get('page') || searchParams.get('limit'));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Postlar</h1>
        <p className="mt-1 text-sm text-slate-600">
          Hamjamiyat yozgan maqolalarni o'qing va o'zingiznikini yozing.
        </p>
      </div>

      {/* Filtrlar paneli */}
      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Sarlavha bo'yicha qidirish"
              placeholder="masalan: nestjs"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-44">
            <Select
              label="Saralash"
              value={`${sortBy}:${order}`}
              onChange={(e) => {
                const [newSortBy, newOrder] = e.target.value.split(':');
                updateFilter({ sortBy: newSortBy, order: newOrder });
              }}
            >
              <option value="createdAt:DESC">Avval yangilari</option>
              <option value="createdAt:ASC">Avval eskilari</option>
              <option value="title:ASC">Sarlavha (A–Z)</option>
              <option value="title:DESC">Sarlavha (Z–A)</option>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="submit">Qidirish</Button>
            {hasFilters && (
              <Button type="button" variant="secondary" onClick={clearFilters}>
                Tozalash
              </Button>
            )}
          </div>
        </form>

        {/* Faol teg filtri ko'rsatkichi */}
        {tags && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-slate-500">Teg bo'yicha:</span>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 font-medium text-indigo-700">
              {tags}
            </span>
            <button
              onClick={() => updateFilter({ tags: '' })}
              className="text-slate-400 hover:text-red-600"
              aria-label="Teg filtrini olib tashlash"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {loading && <PageLoader />}

      {!loading && error && <ErrorBox message={error} onRetry={fetchPosts} />}

      {!loading && !error && posts.length === 0 && (
        <EmptyState
          title="Post topilmadi"
          description={
            hasFilters
              ? 'Filtrlarni o\'zgartirib ko\'ring yoki tozalang.'
              : 'Hozircha birorta post yo\'q. Birinchi bo\'lib yozing!'
          }
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Filtrlarni tozalash
              </Button>
            ) : null
          }
        />
      )}

      {!loading && !error && posts.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination meta={meta} onPageChange={(p) => updateFilter({ page: p })} />
        </>
      )}
    </div>
  );
}
