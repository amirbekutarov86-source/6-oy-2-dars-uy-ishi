import { Link } from 'react-router-dom';
import { formatDate, truncate } from '../utils/format';
import { Avatar, TagBadge } from './ui';

/**
 * Postlar ro'yxatidagi bitta karta.
 *
 * Backend har bir post bilan birga `author` (id, username, avatar) va `tags` ni
 * qaytaradi, shuning uchun bu yerda qo'shimcha so'rov kerak emas.
 */
export default function PostCard({ post }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-md">
      {post.image && (
        <Link to={`/posts/${post.id}`}>
          <img src={post.image} alt={post.title} className="h-48 w-full object-cover" />
        </Link>
      )}

      <div className="flex flex-1 flex-col p-5">
        {post.tags?.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Link key={tag.id} to={`/tags/${tag.slug}`}>
                <TagBadge className="hover:bg-indigo-100">{tag.name}</TagBadge>
              </Link>
            ))}
          </div>
        )}

        <h2 className="text-lg leading-snug font-semibold text-slate-900">
          <Link to={`/posts/${post.id}`} className="hover:text-indigo-600">
            {post.title}
          </Link>
        </h2>

        <p className="mt-2 flex-1 text-sm text-slate-600">{truncate(post.content)}</p>

        <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
          <Link to={`/users/${post.author?.id}`}>
            <Avatar src={post.author?.avatar} name={post.author?.username} size="sm" />
          </Link>
          <div className="min-w-0">
            <Link
              to={`/users/${post.author?.id}`}
              className="block truncate text-sm font-medium text-slate-800 hover:text-indigo-600"
            >
              {post.author?.username}
            </Link>
            <span className="text-xs text-slate-500">{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
