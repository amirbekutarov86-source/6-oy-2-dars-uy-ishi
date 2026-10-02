import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, ErrorBox, Input } from '../components/ui';

/**
 * Ro'yxatdan o'tish.
 *
 * Backend talablari:
 *   username — 3–30 belgi, faqat harf, raqam va pastki chiziq
 *   email    — to'g'ri email
 *   password — kamida 8 belgi, kamida 1 ta harf va 1 ta raqam
 */
export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [values, setValues] = useState({ username: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setFormError(null);
    setFieldErrors({});

    try {
      await register(values);
      showToast('Hisobingiz yaratildi!');
      navigate('/', { replace: true });
    } catch (err) {
      setFieldErrors(err.fieldErrors || {});
      // 409 — bunday email yoki username band.
      setFormError(err.fieldErrors && Object.keys(err.fieldErrors).length ? null : err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Ro'yxatdan o'tish</h1>
        <p className="mt-1 mb-6 text-sm text-slate-600">
          Hisob yarating va o'z postlaringizni yozing.
        </p>

        {formError && (
          <div className="mb-4">
            <ErrorBox message={formError} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Foydalanuvchi nomi"
            name="username"
            value={values.username}
            onChange={handleChange}
            error={fieldErrors.username?.[0]}
            placeholder="alice_99"
            autoComplete="username"
            required
          />
          <p className="-mt-3 text-xs text-slate-500">
            3–30 belgi. Faqat harf, raqam va pastki chiziq (_).
          </p>

          <Input
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={fieldErrors.email?.[0]}
            placeholder="alice@example.com"
            autoComplete="email"
            required
          />

          <Input
            label="Parol"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            error={fieldErrors.password?.[0]}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
          <p className="-mt-3 text-xs text-slate-500">
            Kamida 8 belgi, ichida kamida bitta harf va bitta raqam bo'lsin.
          </p>

          <Button type="submit" loading={loading} className="mt-2 w-full">
            Ro'yxatdan o'tish
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Hisobingiz bormi?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}
