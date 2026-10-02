import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-bold text-indigo-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Sahifa topilmadi</h1>
      <p className="mt-2 text-sm text-slate-600">
        Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan.
      </p>
      <Link to="/" className="mt-6">
        <Button>Bosh sahifaga</Button>
      </Link>
    </div>
  );
}
