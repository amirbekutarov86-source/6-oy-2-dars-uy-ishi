/** Sanani o'zbekcha ko'rinishda chiqarish: "16-sentabr, 2026" */
const MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
];

export function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return `${date.getDate()}-${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}

/** Uzun matnni qisqartirish (post ro'yxatidagi ko'rinish uchun). */
export function truncate(text, maxLength = 160) {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > maxLength ? `${clean.slice(0, maxLength)}…` : clean;
}
