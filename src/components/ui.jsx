/**
 * Kichik, qayta ishlatiladigan UI bo'laklari.
 * Alohida fayllarga bo'lmadik — hammasi kichkina va bir joyda ko'rish qulay.
 */

/** Tugma. variant: primary | secondary | danger | ghost */
export function Button({
  variant = 'primary',
  type = 'button',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-slate-600 hover:bg-slate-100',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

/** Matn maydoni. `error` berilsa, chegara qizarib, tagida xabar chiqadi. */
export function Input({ label, error, className = '', ...rest }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>}
      <input
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
          error
            ? 'border-red-400 focus:ring-red-200'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
        } ${className}`}
        {...rest}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

/** Ko'p qatorli matn maydoni. */
export function Textarea({ label, error, className = '', ...rest }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>}
      <textarea
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
          error
            ? 'border-red-400 focus:ring-red-200'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
        } ${className}`}
        {...rest}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

/** Tanlash maydoni. */
export function Select({ label, className = '', children, ...rest }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>}
      <select
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 ${className}`}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}

/** Yuklanish indikatori. */
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${sizes[size]}`}
      role="status"
      aria-label="Yuklanmoqda"
    />
  );
}

/** Sahifa markazidagi katta yuklanish holati. */
export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-indigo-600">
      <Spinner size="lg" />
    </div>
  );
}

/** Xato xabari bloki. */
export function ErrorBox({ message, onRetry }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 font-medium underline hover:no-underline">
          Qayta urinish
        </button>
      )}
    </div>
  );
}

/** Ma'lumot topilmaganda ko'rsatiladigan bo'sh holat. */
export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

/** Teg yorlig'i. */
export function TagBadge({ children, className = '' }) {
  return (
    <span
      className={`inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ${className}`}
    >
      #{children}
    </span>
  );
}

/** Foydalanuvchi avatari. Rasm yo'q bo'lsa — ism bosh harfi. */
export function Avatar({ src, name = '?', size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-24 w-24 text-2xl',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} shrink-0 rounded-full object-cover ring-1 ring-slate-200`}
      />
    );
  }

  return (
    <span
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700 uppercase`}
    >
      {name.charAt(0)}
    </span>
  );
}
