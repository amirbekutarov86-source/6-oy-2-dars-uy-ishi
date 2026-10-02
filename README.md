# Blog — Frontend

Blog API uchun React interfeysi. JavaScript (TypeScript emas), holat boshqaruvi `useReducer` + `useContext` (Redux yo'q), uslublar faqat Tailwind CSS.

---

## 1. Ishga tushirish

Backend ishlab turgan bo'lishi kerak (`http://localhost:3000`). Backendni ishga tushirish bo'yicha asosiy `README.md` ga qarang.

```bash
cd frontend
npm install
cp .env.example .env    # kerak bo'lsa API manzilini o'zgartiring
npm run dev
```

Brauzerda: `http://localhost:5173`

### Buyruqlar

| Buyruq | Vazifasi |
|---|---|
| `npm run dev` | Dev server (hot reload bilan) |
| `npm run build` | Production uchun qurish → `dist/` |
| `npm run preview` | Qurilgan versiyani ko'rish |
| `npm run lint` | Kodni tekshirish (oxlint) |

### `.env`

```
VITE_API_URL=http://localhost:3000/api/v1
```

Vite'da env o'zgaruvchilari **`VITE_`** bilan boshlanishi shart, aks holda brauzerga yetib bormaydi. O'zgartirgandan keyin dev serverni qayta ishga tushiring.

---

## 2. Papkalar tuzilishi

```
src/
  main.jsx              # kirish nuqtasi
  App.jsx               # marshrutlar (routes) va provider'lar
  index.css             # Tailwind import + bir nechta global uslub

  api/                  # ⭐ API bilan ishlashning butun mantig'i shu yerda
    client.js           # fetch o'ram: token, xatolar, javob formatini ochish
    auth.js             # /auth/* endpointlari
    posts.js            # /posts/* endpointlari
    users.js            # /users/* endpointlari
    tags.js             # /tags/* endpointlari

  context/
    AuthContext.jsx     # kim tizimda — useReducer + useContext
    ToastContext.jsx    # ekran burchagidagi xabarlar

  components/
    ui.jsx              # Button, Input, Textarea, Select, Spinner, Avatar va h.k.
    Navbar.jsx
    PostCard.jsx
    Pagination.jsx
    ProtectedRoute.jsx  # token/rol talab qiladigan sahifalar uchun o'ram

  pages/
    HomePage.jsx        # postlar + qidiruv, teg filtri, saralash
    PostDetailPage.jsx
    PostFormPage.jsx    # yaratish va tahrirlash (bitta forma)
    MyPostsPage.jsx
    ProfilePage.jsx     # ma'lumotlar + avatar + parol
    PublicProfilePage.jsx
    TagsPage.jsx
    TagPostsPage.jsx
    LoginPage.jsx
    RegisterPage.jsx
    NotFoundPage.jsx
    admin/
      AdminUsersPage.jsx  # superadmin: foydalanuvchilar
      AdminTagsPage.jsx   # superadmin: teglar
      AdminTabs.jsx

  utils/
    format.js           # sana va matnni formatlash
```

---

## 3. API bilan qanday ishlaymiz

Bu loyihaning eng muhim qismi. Hammasi [`src/api/client.js`](src/api/client.js) dan boshlanadi.

### 3.1. Backend javob formati

Backend **barcha** javoblarni bir xil o'ramda qaytaradi:

```jsonc
// Muvaffaqiyat
{ "success": true, "data": { ... } }

// Sahifalangan ro'yxat
{ "success": true, "data": [ ... ], "meta": { "page": 1, "limit": 10, "total": 57, "totalPages": 6 } }

// Xato
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "email", "messages": ["email must be an email"] }]
}
```

`client.js` shu o'ramni ochib beradi, shuning uchun sahifalarda `response.data.data` kabi narsa yozilmaydi — to'g'ridan-to'g'ri `data` keladi.

### 3.2. Token qayerda saqlanadi

Login yoki register muvaffaqiyatli bo'lganda backend `accessToken` qaytaradi. U `localStorage` ga yoziladi:

```js
localStorage.setItem('blog_access_token', token);
```

Keyin **har bir** so'rovga avtomatik qo'shiladi:

```js
headers.Authorization = `Bearer ${token}`;
```

Sahifa yangilanganda `AuthContext` `GET /auth/me` ni chaqirib, token hali yaroqli ekanini tekshiradi. Yaroqsiz bo'lsa (`401`), token o'chiriladi va foydalanuvchi mehmon holatiga o'tadi.

> **Eslatma:** `localStorage` XSS hujumiga qarshi himoyalanmagan. O'quv loyihasi uchun bu qabul qilinarli va eng tushunarli yo'l. Haqiqiy production'da `httpOnly` cookie xavfsizroq, lekin u backendda ham o'zgarish talab qiladi.

### 3.3. Xatolarni ko'rsatish

`client.js` xato bo'lganda `ApiError` tashlaydi:

```js
try {
  await login({ login: email, password });
} catch (err) {
  err.status        // 401, 409, 400 ...
  err.message       // "Invalid credentials"
  err.fieldErrors   // { email: ['email must be an email'] }
}
```

`fieldErrors` — backend validatsiyasidan kelgan xatolar. Formalar uni shunday ishlatadi:

```jsx
<Input
  name="email"
  value={values.email}
  onChange={handleChange}
  error={fieldErrors.email?.[0]}   // input tagida qizil matn chiqadi
/>
```

Ya'ni **validatsiya qoidalari faqat backendda yozilgan**, frontend ularni takrorlamaydi — shunchaki natijani ko'rsatadi. Bu ikki joyda bir xil qoidani saqlash muammosini yo'q qiladi.

### 3.4. Fayl yuklash (multipart)

Post rasmi va avatar `FormData` orqali yuboriladi:

```js
const formData = new FormData();
formData.append('title', title);
formData.append('image', file);      // <input type="file"> dan olingan File
```

**Muhim:** `FormData` yuborayotganda `Content-Type` sarlavhasini **qo'lda qo'ymaslik** kerak. Brauzer uni o'zi `multipart/form-data; boundary=...` qilib to'ldiradi. Qo'lda yozsangiz, boundary tushib qoladi va backend faylni o'qiy olmaydi. `client.js` da shu hisobga olingan.

Fayl tekshiruvi ikki bosqichda:
1. **Frontend** — MIME turi va hajmini darhol tekshiradi (foydalanuvchiga tez javob).
2. **Backend** — fayl **imzosini (magic bytes)** tekshiradi. Ya'ni `.jpg` deb nomlangan matn faylini ham tutib qoladi. Bu asosiy himoya.

### 3.5. Teglar

Backend teglarni vergul bilan ajratilgan satr sifatida qabul qiladi:

```
tags=nestjs,react,backend
```

Mavjud bo'lmagan teglar **avtomatik yaratiladi** — alohida "teg yaratish" endpointi kerak emas.

### 3.6. Filtrlar va sahifalash

`GET /posts` quyidagilarni qabul qiladi:

| Parametr | Izoh |
|---|---|
| `page`, `limit` | sahifalash (`limit` maksimal 50) |
| `search` | sarlavha bo'yicha qismli qidiruv |
| `tag` / `tags` | bitta teg yoki `tags=a,b` (shulardan **biri** bo'lgan postlar) |
| `authorId` | muallif bo'yicha |
| `sortBy`, `order` | `createdAt`\|`title`, `ASC`\|`DESC` |

Bosh sahifada filtrlar **URL query'sida** saqlanadi (`useSearchParams`), shuning uchun:
- sahifani yangilasangiz filtrlar yo'qolmaydi,
- havolani birovga yuborsangiz, u ham xuddi shu natijani ko'radi,
- brauzerning "orqaga" tugmasi to'g'ri ishlaydi.

---

## 4. Holat boshqaruvi (Redux o'rniga)

### AuthContext

`useReducer` bilan yozilgan, chunki holat o'zgarishlari bir nechta maydonga tegadi:

```js
// Holat
{ user: null, status: 'loading' | 'authenticated' | 'guest' }

// Amallar (actions)
AUTH_SUCCESS   // login/register/me muvaffaqiyatli
AUTH_GUEST     // token yo'q yoki yaroqsiz
USER_UPDATED   // profil tahrirlandi
```

Ishlatilishi:

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isSuperadmin, login, logout, setUser } = useAuth();
  // ...
}
```

`status` uchta holatda bo'lishi muhim: sahifa endi ochilganda token hali tekshirilmagan (`loading`). Agar bu holat bo'lmasa, foydalanuvchi bir lahzaga login sahifasiga uloqtiriladi, keyin qaytariladi — bu yomon ko'rinadi.

### ToastContext

Qisqa xabarlar uchun. `useToast()` dan `showToast(message, type)` olinadi:

```js
showToast('Post yaratildi');            // yashil
showToast('Xatolik yuz berdi', 'error'); // qizil
```

### Nega Redux emas?

Bu ilovada global holat faqat ikkita: **kim tizimda** va **xabarlar**. Qolgan hamma narsa — postlar, teglar, foydalanuvchilar ro'yxati — sahifaga tegishli va sahifa ichida `useState` bilan boshqariladi. Bunday hajm uchun Redux ortiqcha murakkablik qo'shadi.

---

## 5. Sahifalar va ruxsatlar

| Sahifa | Yo'l | Kirish |
|---|---|---|
| Postlar ro'yxati | `/` | hamma |
| Post | `/posts/:id` | hamma |
| Teglar | `/tags` | hamma |
| Teg postlari | `/tags/:slug` | hamma |
| Ommaviy profil | `/users/:id` | hamma |
| Kirish | `/login` | mehmon |
| Ro'yxatdan o'tish | `/register` | mehmon |
| Yangi post | `/posts/new` | tizimda |
| Postni tahrirlash | `/posts/:id/edit` | egasi yoki superadmin |
| Mening postlarim | `/my-posts` | tizimda |
| Profil | `/profile` | tizimda |
| Foydalanuvchilar | `/admin/users` | superadmin |
| Teglarni boshqarish | `/admin/tags` | superadmin |

### Ruxsatlar qayerda tekshiriladi

`ProtectedRoute` va tugmalarni yashirish — bu **faqat interfeys qulayligi uchun**. Haqiqiy himoya backendda:

- token yo'q → `401`
- begona postni tahrirlash → `403`
- oddiy foydalanuvchi `/users` ga → `403`
- superadmin o'zini o'chirmoqchi → `403`

Ya'ni brauzerda JavaScript'ni o'zgartirib tugmani "ochish" hech narsa bermaydi — so'rov baribir backendda rad etiladi.

---

## 6. Uslublar (Tailwind)

Tailwind CSS v4 ishlatilgan. v3 dan farqi — `tailwind.config.js` fayli **kerak emas**:

- Vite plugin: `@tailwindcss/vite` (`vite.config.js` da)
- CSS'da bitta qator: `@import 'tailwindcss';`

Ranglar: asosiy rang `indigo`, fon `slate-50`, matn `slate-800`. Barcha o'lchamlar mobil ekrandan boshlab yozilgan (`sm:`, `md:`, `lg:` bilan kattalashadi).

Takrorlanadigan elementlar `components/ui.jsx` da yig'ilgan — `Button`, `Input`, `Textarea`, `Select`, `Spinner`, `Avatar`, `EmptyState`, `ErrorBox`, `TagBadge`. Yangi sahifa yozganda shulardan foydalaning, `className` ni noldan yozmang.

---

## 7. Tez-tez uchraydigan muammolar

**Postlar ko'rinmayapti / "Serverga ulanib bo'lmadi"**
Backend ishlayaptimi? Tekshiring: `curl http://localhost:3000/api/v1/health`

**CORS xatosi konsolda**
Backend `.env` dagi `CORS_ORIGINS` ga `http://localhost:5173` qo'shing va backendni qayta ishga tushiring.

**Rasm ko'rinmayapti (buzilgan rasm belgisi)**
Backend `.env` dagi `APP_URL` to'g'rimi? Rasm URL'lari shundan quriladi. Development'da `http://localhost:3000` bo'lishi kerak.

**Tizimga kirdim, lekin sahifani yangilasam chiqib ketyapti**
Token muddati tugagan (`JWT_EXPIRES_IN`, default `1d`) yoki backend `JWT_SECRET` o'zgargan. Qayta kiring.

**`.env` o'zgartirdim, lekin ta'sir qilmadi**
Vite env o'zgaruvchilarini faqat ishga tushganda o'qiydi. Dev serverni to'xtatib, qayta ishga tushiring.

---

## 8. Eslatma

Bu frontend **deploy qilinmaydi** — faqat lokalda ishlatish uchun mo'ljallangan. Shuning uchun bu yerda Nginx, CI/CD yoki domen sozlamalari yo'q. Agar keyinchalik kerak bo'lsa, `npm run build` natijasidagi `dist/` papkasini istalgan statik hosting'ga qo'yish kifoya (Nginx, Vercel, Netlify).
