import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deletePost, listMyPosts } from '../api/posts';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/format';
import Pagination from '../components/Pagination';
import { Button, EmptyState, ErrorBox, PageLoader, TagBadge } from '../components/ui';

/**
 * Foydalanuvchining o'z postlari — jadval ko'rinishida,
 * har birida tahrirlash va o'chirish tugmalari bilan.
 *
 * GET /posts/my endpointi tokendan foydalanuvchini aniqlaydi.
 */
export default function MyPostsPage() {
  const { showToast } = useToast();

  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listMyPosts({ page, limit: 10 });
      setPosts(result.items);
      setMeta(result.meta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  async function handleDelete(post) {
    if (!window.confirm(`"${post.title}" postini o'chirasizmi?`)) return;

    setDeletingId(post.id);
    try {
      await deletePost(post.id);
      showToast('Post o\'chirildi');

      // Oxirgi sahifadagi oxirgi post o'chirilsa, oldingi sahifaga o'tamiz.
      if (posts.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchPosts();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mening postlarim</h1>
          {meta && <p className="mt-1 text-sm text-slate-600">Jami {meta.total} ta post</p>}
        </div>
        <Link to="/posts/new">
          <Button>Yangi post</Button>
        </Link>
      </div>

      {loading && <PageLoader />}
      {!loading && error && <ErrorBox message={error} onRetry={fetchPosts} />}

      {!loading && !error && posts.length === 0 && (
        <EmptyState
          title="Hali post yozmagansiz"
          description="Birinchi postingizni yozib, hamjamiyat bilan ulashing."
          action={
            <Link to="/posts/new">
              <Button>Birinchi postni yozish</Button>
            </Link>
          }
        />
      )}

      {!loading && !error && posts.length > 0 && (
        <>
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center"
              >
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-20 w-full rounded-lg object-cover sm:w-28"
                  />
                ) : (
                  <div className="flex h-20 w-full items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400 sm:w-28">
                    Rasm yo'q
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <Link
                    to={`/posts/${post.id}`}
                    className="block truncate font-semibold text-slate-900 hover:text-indigo-600"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-slate-500">{formatDate(post.createdAt)}</p>
                  {post.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <TagBadge key={tag.id}>{tag.name}</TagBadge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  <Link to={`/posts/${post.id}/edit`}>
                    <Button variant="secondary">Tahrirlash</Button>
                  </Link>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(post)}
                    loading={deletingId === post.id}
                  >
                    O'chirish
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
