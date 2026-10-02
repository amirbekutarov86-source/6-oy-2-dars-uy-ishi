import { NavLink } from 'react-router-dom';

/** Admin panel bo'limlari orasida o'tish. */
export default function AdminTabs() {
  const linkClass = ({ isActive }) =>
    `rounded-lg px-4 py-2 text-sm font-medium transition ${
      isActive ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
    }`;

  return (
    <div className="my-6 flex gap-2">
      <NavLink to="/admin/users" className={linkClass}>
        Foydalanuvchilar
      </NavLink>
      <NavLink to="/admin/tags" className={linkClass}>
        Teglar
      </NavLink>
    </div>
  );
}
