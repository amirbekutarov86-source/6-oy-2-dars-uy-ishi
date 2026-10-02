import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listPosts } from '../api/posts';
import { getPublicProfile } from '../api/users';
import Pagination from '../components/Pagination';
import PostCard from '../components/PostCard';
import { formatDate } from '../utils/format';
import { Avatar, EmptyState, ErrorBox, PageLoader } from '../components/ui';

/**
 * Boshqa foydalanuvchining ommaviy profili.
 *
 * Ikki so'rov ketadi:
 *   GET /users/:id            — profil (email ko'rsatilmaydi)
 *   GET /posts?authorId=:id   — o'sha odamning postlari
 */
export default function PublicProfilePage() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [id]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Ikkala so'rovni parallel yuboramiz — ketma-ket kutishdan tezroq.
      const [profileData, postsData] = await Promise.all([
        getPublicProfile(id),
        listPosts({ authorId: id, page, limit: 6 }),
      ]);
      setProfile(profileData);
      setPosts(postsData.items);
      setMeta(postsData.meta);
    } catch (err) {
      setError(err.status === 404 ? 'Bunday foydalanuvchi topilmadi' : err.message);
    } finally {
      setLoading(false);
    }
  }, [id, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <PageLoader />;
  if (error) return <ErrorBox message={error} />;
  if (!profile) return null;

  return (
    <div>
      <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <Avatar src={profile.avatar} name={profile.username} size="lg" />

          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">{profile.username}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {formatDate(profile.createdAt)} dan beri a'zo · {profile.postsCount} ta post
            </p>
            {profile.bio && <p className="mt-3 text-sm text-slate-700">{profile.bio}</p>}
          </div>
        </div>
      </section>

      <h2 className="mb-4 text-lg font-semibold text-slate-900">Postlari</h2>

      {posts.length === 0 ? (
        <EmptyState title="Post yo'q" description="Bu foydalanuvchi hali post yozmagan." />
      ) : (
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
