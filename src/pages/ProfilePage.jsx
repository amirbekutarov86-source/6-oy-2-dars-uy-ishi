import { useState } from 'react';
import { changePassword, deleteAvatar, updateProfile, uploadAvatar } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Avatar, Button, ErrorBox, Input, Textarea } from '../components/ui';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AVATAR_MB = 2; // backend default: MAX_AVATAR_SIZE_MB=2

/**
 * O'z profili: ma'lumotlarni tahrirlash, avatar va parol.
 * Uchta mustaqil forma — har biri o'z API chaqiruviga ega.
 */
export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Profil</h1>
      <div className="flex flex-col gap-6">
        <AvatarSection user={user} setUser={setUser} showToast={showToast} />
        <ProfileSection user={user} setUser={setUser} showToast={showToast} />
        <PasswordSection showToast={showToast} />
      </div>
    </div>
  );
}

/** Avatar yuklash va o'chirish. */
function AvatarSection({ user, setUser, showToast }) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast('Faqat JPEG, PNG yoki WebP rasm yuklash mumkin', 'error');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
      showToast(`Avatar hajmi ${MAX_AVATAR_MB} MB dan oshmasligi kerak`, 'error');
      event.target.value = '';
      return;
    }

    setUploading(true);
    try {
      // Backend eski avatarni diskdan o'zi o'chiradi.
      const updated = await uploadAvatar(file);
      setUser(updated);
      showToast('Avatar yangilandi');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function handleDelete() {
    setUploading(true);
    try {
      const updated = await deleteAvatar();
      setUser(updated);
      showToast('Avatar o\'chirildi');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Avatar</h2>

      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <Avatar src={user?.avatar} name={user?.username} size="lg" />

        <div className="flex-1">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <p className="mt-1 text-xs text-slate-500">
            JPEG, PNG yoki WebP. Maksimal {MAX_AVATAR_MB} MB.
          </p>

          {user?.avatar && (
            <button
              onClick={handleDelete}
              disabled={uploading}
              className="mt-2 text-sm text-red-600 hover:underline disabled:opacity-50"
            >
              Avatarni o'chirish
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/** Username, email va bio. */
function ProfileSection({ user, setUser, showToast }) {
  const [values, setValues] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const updated = await updateProfile(values);
      setUser(updated);
      showToast('Profil yangilandi');
    } catch (err) {
      setFieldErrors(err.fieldErrors || {});
      // 409 — username yoki email band.
      setFormError(Object.keys(err.fieldErrors || {}).length ? null : err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Ma'lumotlar</h2>

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
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          error={fieldErrors.email?.[0]}
        />
        <div>
          <Textarea
            label="O'zingiz haqingizda"
            name="bio"
            value={values.bio}
            onChange={handleChange}
            error={fieldErrors.bio?.[0]}
            rows={3}
            maxLength={500}
            placeholder="Bir necha so'z bilan o'zingizni tanishtiring"
          />
          <p className="mt-1 text-right text-xs text-slate-500">{values.bio.length}/500</p>
        </div>

        <div>
          <Button type="submit" loading={saving}>
            Saqlash
          </Button>
        </div>
      </form>
    </section>
  );
}

/** Parolni o'zgartirish. */
function PasswordSection({ showToast }) {
  const [values, setValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Tasdiqlash maydonini shu yerda tekshiramiz — backendda bunday maydon yo'q.
    if (values.newPassword !== values.confirmPassword) {
      setFieldErrors({ confirmPassword: ['Parollar mos kelmadi'] });
      return;
    }

    setSaving(true);
    setFormError(null);
    setFieldErrors({});

    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Parol o\'zgartirildi');
    } catch (err) {
      setFieldErrors(err.fieldErrors || {});
      // 401 — joriy parol noto'g'ri.
      setFormError(
        err.status === 401
          ? 'Joriy parol noto\'g\'ri'
          : Object.keys(err.fieldErrors || {}).length
            ? null
            : err.message,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-1 text-lg font-semibold text-slate-900">Parolni o'zgartirish</h2>
      <p className="mb-4 text-sm text-slate-500">
        Parol o'zgargandan keyin ham joriy sessiyangiz saqlanadi.
      </p>

      {formError && (
        <div className="mb-4">
          <ErrorBox message={formError} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Joriy parol"
          name="currentPassword"
          type="password"
          value={values.currentPassword}
          onChange={handleChange}
          error={fieldErrors.currentPassword?.[0]}
          autoComplete="current-password"
          required
        />
        <div>
          <Input
            label="Yangi parol"
            name="newPassword"
            type="password"
            value={values.newPassword}
            onChange={handleChange}
            error={fieldErrors.newPassword?.[0]}
            autoComplete="new-password"
            required
          />
          <p className="mt-1 text-xs text-slate-500">
            Kamida 8 belgi, kamida bitta harf va bitta raqam.
          </p>
        </div>
        <Input
          label="Yangi parolni tasdiqlang"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={fieldErrors.confirmPassword?.[0]}
          autoComplete="new-password"
          required
        />

        <div>
          <Button type="submit" loading={saving}>
            Parolni o'zgartirish
          </Button>
        </div>
      </form>
    </section>
  );
}
