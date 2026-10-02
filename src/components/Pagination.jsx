import { Button } from './ui';

/**
 * Sahifalash. Backend `meta` obyektini qaytaradi:
 *   { page, limit, total, totalPages }
 */
export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;

  const { page, totalPages, total } = meta;

  // Ko'rsatiladigan sahifa raqamlari: joriy sahifa atrofidagi 2 tadan.
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-1">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Oldingi
        </Button>

        {start > 1 && (
          <>
            <Button variant="ghost" onClick={() => onPageChange(1)}>
              1
            </Button>
            {start > 2 && <span className="px-1 text-slate-400">…</span>}
          </>
        )}

        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? 'primary' : 'ghost'}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
            <Button variant="ghost" onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Keyingi
        </Button>
      </div>

      <p className="text-xs text-slate-500">
        Jami {total} ta natija · {page}/{totalPages}-sahifa
      </p>
    </div>
  );
}
