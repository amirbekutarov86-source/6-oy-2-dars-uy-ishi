import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { changeUserRole, deleteUser, listUsers } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';
import Pagination from '../../components/Pagination';
import AdminTabs from './AdminTabs';
import { Avatar, Button, EmptyState, ErrorBox, Input, PageLoader, Select } from '../../components/ui';

/**
 * Superadmin: foydalanuvchilarni boshqarish.
 *
 * GET    /users            — qidiruv va rol bo'yicha filtr
 * PATCH  /users/:id/role   — rolni o'zgartirish
 * DELETE /users/:id        — foydalanuvchi, postlari va fayllari o'chadi
 *
 * Backend superadminning o'zini o'chirishiga va o'z rolini tushirishiga
 * ruxsat bermaydi (403). Shuning uchun bu tugmalar bu yerda ham yashiriladi.
 */
export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listUsers({ page, limit: 10, search: search.trim(), role });
      setUsers(result.items);
      setMeta(result.meta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, role]);

  // Qidiruv uchun debounce — har bir harfda so'rov yubormaslik uchun.
  useEffect(() => {
    const timer = setTimeout(fetchUsers, 400);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // Filtr o'zgarsa 1-sahifaga qaytamiz.
  useEffect(() => {
    setPage(1);
  }, [search, role]);

  async function handleRoleChange(target, newRole) {
    const action = newRole === 'superadmin' ? 'superadmin qilish' : 'oddiy foydalanuvchi qilish';
    if (!window.confirm(`"${target.username}" ni ${action}ni tasdiqlaysizmi?`)) return;

    setBusyId(target.id);
    try {
      await changeUserRole(target.id, newRole);
      showToast('Rol o\'zgartirildi');
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(target) {
    if (
      !window.confirm(
        `"${target.username}" ni o'chirasizmi?\n\nUning barcha postlari va fayllari ham o'chadi. Buni orqaga qaytarib bo'lmaydi.`,
      )
    ) {
      return;
    }

    setBusyId(target.id);
    try {
      await deleteUser(target.id);
      showToast('Foydalanuvchi o\'chirildi');
      if (users.length === 1 && page > 1) setPage((p) => p - 1);
      else fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Admin panel</h1>
      <AdminTabs />

      <div className="mb-6 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            label="Qidirish"
            placeholder="Foydalanuvchi nomi yoki email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-52">
          <Select label="Rol" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Barchasi</option>
            <option value="user">Foydalanuvchi</option>
            <option value="superadmin">Superadmin</option>
          </Select>
        </div>
      </div>

      {loading && <PageLoader />}
      {!loading && error && <ErrorBox message={error} onRetry={fetchUsers} />}

      {!loading && !error && users.length === 0 && (
        <EmptyState title="Foydalanuvchi topilmadi" description="Filtrlarni o'zgartirib ko'ring." />
      )}

      {!loading && !error && users.length > 0 && (
        <>
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            {/* Katta ekranlar uchun jadval */}
            <table className="hidden w-full text-sm md:table">
              <thead className="bg-slate-50 text-left text-xs tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Foydalanuvchi</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Ro'yxatdan o'tgan</th>
                  <th className="px-4 py-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((item) => {
                  const isSelf = item.id === currentUser?.id;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link
                          to={`/users/${item.id}`}
                          className="flex items-center gap-3 font-medium text-slate-800 hover:text-indigo-600"
                        >
                          <Avatar src={item.avatar} name={item.username} size="sm" />
                          {item.username}
                          {isSelf && <span className="text-xs text-slate-400">(siz)</span>}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.email}</td>
                      <td className="px-4 py-3">
                        <RoleBadge role={item.role} />
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {/* O'ziga nisbatan amallar ko'rsatilmaydi — backend ham rad etadi. */}
                          {!isSelf && (
                            <>
                              <Button
                                variant="secondary"
                                disabled={busyId === item.id}
                                onClick={() =>
                                  handleRoleChange(
                                    item,
                                    item.role === 'superadmin' ? 'user' : 'superadmin',
                                  )
                                }
                              >
                                {item.role === 'superadmin' ? 'Rolni tushirish' : 'Superadmin qilish'}
                              </Button>
                              <Button
                                variant="danger"
                                loading={busyId === item.id}
                                onClick={() => handleDelete(item)}
                              >
                                O'chirish
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Kichik ekranlar uchun kartalar */}
            <div className="divide-y divide-slate-100 md:hidden">
              {users.map((item) => {
                const isSelf = item.id === currentUser?.id;
                return (
                  <div key={item.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={item.avatar} name={item.username} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-800">
                          {item.username} {isSelf && <span className="text-xs text-slate-400">(siz)</span>}
                        </p>
                        <p className="truncate text-xs text-slate-500">{item.email}</p>
                      </div>
                      <RoleBadge role={item.role} />
                    </div>

                    {!isSelf && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="secondary"
                          disabled={busyId === item.id}
                          onClick={() =>
                            handleRoleChange(item, item.role === 'superadmin' ? 'user' : 'superadmin')
                          }
                        >
                          {item.role === 'superadmin' ? 'Rolni tushirish' : 'Superadmin qilish'}
                        </Button>
                        <Button
                          variant="danger"
                          loading={busyId === item.id}
                          onClick={() => handleDelete(item)}
                        >
                          O'chirish
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

function RoleBadge({ role }) {
  const isAdmin = role === 'superadmin';
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
      }`}
    >
      {isAdmin ? 'Superadmin' : 'Foydalanuvchi'}
    </span>
  );
}
