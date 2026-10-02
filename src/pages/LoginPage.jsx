import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, ErrorBox, Input } from '../components/ui';

/** Tizimga kirish sahifasi. */
export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ login: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Allaqachon kirgan bo'lsa, bu sahifa kerak emas.
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
      await login(values);
      showToast('Xush kelibsiz!');
      // Himoyalangan sahifadan kelgan bo'lsa, o'sha yerga qaytaramiz.
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      // Backend maydon xatolarini bersa (validatsiya), ularni inputlar tagida ko'rsatamiz.
      setFieldErrors(err.fieldErrors || {});
      // 401 bo'lsa — "Invalid credentials". Backend ataylab email va parol
      // xatosini ajratmaydi, shunda hujumchi qaysi email mavjudligini bilmaydi.
      setFormError(
        err.status === 401 ? 'Login yoki parol noto\'g\'ri' : err.message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Tizimga kirish</h1>
        <p className="mt-1 mb-6 text-sm text-slate-600">
          Email yoki foydalanuvchi nomingiz bilan kiring.
        </p>

        {formError && (
          <div className="mb-4">
            <ErrorBox message={formError} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email yoki foydalanuvchi nomi"
            name="login"
            value={values.login}
            onChange={handleChange}
            error={fieldErrors.login?.[0]}
            placeholder="alice yoki alice@example.com"
            autoComplete="username"
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
            autoComplete="current-password"
            required
          />

          <Button type="submit" loading={loading} className="mt-2 w-full">
            Kirish
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Hisobingiz yo'qmi?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:underline">
            Ro'yxatdan o'ting
          </Link>
        </p>
      </div>
    </div>
  );
}
