import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPost, deletePostImage, getPost, updatePost } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, ErrorBox, Input, PageLoader, Textarea } from '../components/ui';

// Backend ruxsat beradigan turlar va hajm (MAX_POST_IMAGE_SIZE_MB=5 default).
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE_MB = 5;

/**
 * Post yaratish va tahrirlash — bitta forma.
 * `mode` prop orqali ajratiladi: 'create' yoki 'edit'.
 */
export default function PostFormPage({ mode }) {
  const isEdit = mode === 'edit';
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSuperadmin } = useAuth();
  const { showToast } = useToast();

  const [values, setValues] = useState({ title: '', content: '', tags: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // yangi tanlangan fayl ko'rinishi
  const [existingImage, setExistingImage] = useState(null); // serverda saqlangan rasm URL'i

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // Tahrirlash rejimida mavjud post ma'lumotlarini yuklaymiz.
  useEffect(() => {
    if (!isEdit) return undefined;
    let cancelled = false;

    async function fetchPost() {
      try {
        const post = await getPost(id);
        if (cancelled) return;

        // Egasi yoki superadmin emasmi — darhol qaytaramiz.
        if (post.authorId !== user?.id && !isSuperadmin) {
          showToast('Bu postni tahrirlashga ruxsatingiz yo\'q', 'error');
          navigate(`/posts/${id}`, { replace: true });
          return;
        }

        setValues({
          title: post.title,
          content: post.content,
          // Teglar massivdan vergul bilan ajratilgan satrga aylanadi.
          tags: post.tags?.map((tag) => tag.name).join(', ') || '',
        });
        setExistingImage(post.image);
      } catch (err) {
        if (!cancelled) setFormError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPost();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, user?.id, isSuperadmin, navigate, showToast]);

  // Tanlangan fayl uchun yaratilgan vaqtinchalik URL'ni tozalaymiz (xotira sizib ketmasligi uchun).
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  /**
   * Fayl tanlanganda — serverga yubormasdan oldin shu yerda tekshiramiz.
   * Backend ham tekshiradi (hatto fayl imzosini ham), lekin foydalanuvchiga
   * xatoni darhol ko'rsatgan qulayroq.
   */
  function handleFileChange(event) {
    const file = event.target.files?.[0];
    
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast('Faqat JPEG, PNG yoki WebP rasm yuklash mumkin', 'error');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showToast(`Rasm hajmi ${MAX_SIZE_MB} MB dan oshmasligi kerak`, 'error');
      event.target.value = '';
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearSelectedFile() {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  }

  /** Serverdagi rasmni o'chirish (faqat tahrirlash rejimida). */
  async function handleRemoveExistingImage() {
    if (!window.confirm('Post rasmini o\'chirilsinmi?')) return;
    try {
      await deletePostImage(id);
      setExistingImage(null);
      showToast('Rasm o\'chirildi');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const payload = { ...values, image: imageFile };

      if (isEdit) {
        await updatePost(id, payload);
        showToast('Post yangilandi');
        navigate(`/posts/${id}`);
      } else {
        const post = await createPost(payload);
        showToast('Post yaratildi');
        navigate(`/posts/${post.id}`);
      }
    } catch (err) {
      setFieldErrors(err.fieldErrors || {});
      setFormError(Object.keys(err.fieldErrors || {}).length ? null : err.message);
      setSaving(false);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        {isEdit ? 'Postni tahrirlash' : 'Yangi post'}
      </h1>

      {formError && (
        <div className="mb-4">
          <ErrorBox message={formError} />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <Input
          label="Sarlavha"
          name="title"
          value={values.title}
          onChange={handleChange}
          error={fieldErrors.title?.[0]}
          placeholder="Postingiz sarlavhasi"
          required
        />

        <div>
          <Textarea
            label="Matn"
            name="content"
            value={values.content}
            onChange={handleChange}
            error={fieldErrors.content?.[0]}
            placeholder="Nima haqida yozmoqchisiz?"
            rows={12}
            required
          />
        </div>

        <div>
          <Input
            label="Teglar"
            name="tags"
            value={values.tags}
            onChange={handleChange}
            error={fieldErrors.tags?.[0]}
            placeholder="nestjs, react, backend"
          />
          <p className="mt-1 text-xs text-slate-500">
            Vergul bilan ajrating. Mavjud bo'lmagan teglar avtomatik yaratiladi.
          </p>
        </div>

        {/* Rasm yuklash */}
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Rasm</span>

          {/* Serverdagi mavjud rasm */}
          {existingImage && !imagePreview && (
            <div className="mb-3">
              <img
                src={existingImage}
                alt="Post rasmi"
                className="h-48 w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveExistingImage}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Rasmni o'chirish
              </button>
            </div>
          )}

          {/* Yangi tanlangan fayl ko'rinishi */}
          {imagePreview && (
            <div className="mb-3">
              <img
                src={imagePreview}
                alt="Tanlangan rasm"
                className="h-48 w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={clearSelectedFile}
                className="mt-2 text-sm text-slate-600 hover:underline"
              >
                Tanlovni bekor qilish
              </button>
            </div>
          )}

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <p className="mt-1 text-xs text-slate-500">
            JPEG, PNG yoki WebP. Maksimal {MAX_SIZE_MB} MB.
            {isEdit && ' Yangi rasm yuklasangiz, eskisi almashtiriladi.'}
          </p>
        </div>

        <div className="flex gap-3 border-t border-slate-100 pt-5">
          <Button type="submit" loading={saving}>
            {isEdit ? 'Saqlash' : 'Chop etish'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Bekor qilish
          </Button>
        </div>
      </form>
    </div>
  );
}
