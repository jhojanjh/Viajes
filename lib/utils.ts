import { customAlphabet } from 'nanoid';

export const tripCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

export const fmt = {
  money: (n: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n),
  date: (d: Date | string) =>
    new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d)),
  dateShort: (d: Date | string) =>
    new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(new Date(d)),
};

export const categories = {
  hotel: { label: 'Hotel', color: '#FF6B47' },
  transport: { label: 'Transporte', color: '#2BB089' },
  food: { label: 'Comida', color: '#4A8FE7' },
  activity: { label: 'Actividad', color: '#F5B82E' },
  other: { label: 'Otro', color: '#7B4B94' },
};

export function initials(name?: string | null) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
}

export function colorFromId(id: string) {
  const colors = ['#FF6B47', '#2BB089', '#4A8FE7', '#F5B82E', '#7B4B94', '#E85A87', '#3FB5C5'];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
