import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deletePost, getPost } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/format';
import { Avatar, Button, ErrorBox, PageLoader, TagBadge } from '../components/ui';

/** Bitta postning to'liq sahifasi. */
export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSuperadmin } = useAuth();
  const { showToast } = useToast();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchPost() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPost(id);
        if (!cancelled) setPost(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPost();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Tahrirlash/o'chirish tugmalari faqat egasiga va superadminga ko'rinadi.
  // Backend ham buni tekshiradi — bu yerdagisi faqat interfeys uchun.
  const canEdit = post && user && (post.authorId === user.id || isSuperadmin);

  async function handleDelete() {
    if (!window.confirm('Bu postni o\'chirishni tasdiqlaysizmi? Buni orqaga qaytarib bo\'lmaydi.')) {
      return;
    }
    setDeleting(true);
    try {
      await deletePost(id);
      showToast('Post o\'chirildi');
      navigate('/');
    } catch (err) {
      showToast(err.message, 'error');
      setDeleting(false);
    }
  }

  if (loading) return <PageLoader />;
  if (error) return <ErrorBox message={error} />;
  if (!post) return null;

  return (
    <article className="mx-auto max-w-3xl">
      <Link to="/" className="mb-6 inline-block text-sm text-slate-500 hover:text-indigo-600">
        ← Postlarga qaytish
      </Link>

      {post.tags?.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Link key={tag.id} to={`/tags/${tag.slug}`}>
              <TagBadge className="hover:bg-indigo-100">{tag.name}</TagBadge>
            </Link>
          ))}
        </div>
      )}

      <h1 className="text-3xl leading-tight font-bold text-slate-900 sm:text-4xl">{post.title}</h1>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <Link to={`/users/${post.author?.id}`} className="flex items-center gap-3">
          <Avatar src={post.author?.avatar} name={post.author?.username} />
          <div>
            <span className="block text-sm font-medium text-slate-800">
              {post.author?.username}
            </span>
            <span className="text-xs text-slate-500">{formatDate(post.createdAt)}</span>
          </div>
        </Link>

        {canEdit && (
          <div className="flex gap-2">
            <Link to={`/posts/${post.id}/edit`}>
              <Button variant="secondary">Tahrirlash</Button>
            </Link>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              O'chirish
            </Button>
          </div>
        )}
      </div>

      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="mt-6 w-full rounded-xl object-cover shadow-sm"
        />
      )}

      <div className="post-content mt-6 text-base leading-relaxed text-slate-700">
        {post.content}
      </div>
    </article>
  );
}
