import { createContext, useCallback, useContext, useReducer } from 'react';

/**
 * Ekranning o'ng yuqori burchagida chiqadigan qisqa xabarlar
 * ("Post yaratildi", "Xatolik yuz berdi" va h.k.).
 *
 * Bu ham useReducer — ro'yxatga qo'shish va o'chirish amallari aniq ko'rinadi.
 */

const ToastContext = createContext(null);

function toastReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, action.payload];
    case 'REMOVE':
      return state.filter((toast) => toast.id !== action.payload);
    default:
      throw new Error(`Noma'lum action: ${action.type}`);
  }
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    dispatch({ type: 'ADD', payload: { id, message, type } });
    // 4 soniyadan keyin o'zi yo'qoladi.
    setTimeout(() => dispatch({ type: 'REMOVE', payload: id }), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE', payload: id });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Xabarlar ro'yxati */}
      <div className="fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium shadow-lg transition ${
              toast.type === 'error'
                ? 'bg-red-600 text-white'
                : toast.type === 'info'
                  ? 'bg-slate-800 text-white'
                  : 'bg-emerald-600 text-white'
            }`}
          >
            {toast.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast faqat <ToastProvider> ichida ishlatiladi');
  }
  return context;
}
