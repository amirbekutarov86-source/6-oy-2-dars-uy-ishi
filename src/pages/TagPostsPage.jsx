import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listPostsByTag } from '../api/tags';
import Pagination from '../components/Pagination';
import PostCard from '../components/PostCard';
import { EmptyState, ErrorBox, PageLoader } from '../components/ui';

/** Bitta tegga tegishli postlar: GET /tags/:slug/posts */
export default function TagPostsPage() {
  const { slug } = useParams();

  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Teg almashsa, sahifani boshidan boshlaymiz.
  useEffect(() => {
    setPage(1);
  }, [slug]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listPostsByTag(slug, { page, limit: 9 });
      setPosts(result.items);
      setMeta(result.meta);
    } catch (err) {
      // Teg mavjud bo'lmasa backend 404 qaytaradi.
      setError(err.status === 404 ? `"${slug}" degan teg topilmadi` : err.message);
    } finally {
      setLoading(false);
    }
  }, [slug, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div>
      <Link to="/tags" className="mb-4 inline-block text-sm text-slate-500 hover:text-indigo-600">
        ← Barcha teglar
      </Link>

      <h1 className="text-2xl font-bold text-slate-900">#{slug}</h1>
      {meta && <p className="mt-1 mb-6 text-sm text-slate-600">{meta.total} ta post topildi</p>}

      {loading && <PageLoader />}
      {!loading && error && <ErrorBox message={error} />}

      {!loading && !error && posts.length === 0 && (
        <EmptyState title="Bu tegda post yo'q" description="Boshqa teglarni ko'rib chiqing." />
      )}

      {!loading && !error && posts.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
