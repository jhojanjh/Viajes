'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Compass } from 'lucide-react';

const emojis = ['✈️', '🏖️', '🏔️', '🌴', '🗺️', '🚗', '🎒', '⛵', '🏝️', '🎡', '🍷', '🌊'];

export default function NewTripPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('✈️');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name || !startDate || !endDate) return;
    setLoading(true);
    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, emoji, startDate, endDate,
        budget: budget ? parseFloat(budget) : null,
        baseCurrency: currency,
      }),
    });
    setLoading(false);
    if (res.ok) {
      const trip = await res.json();
      router.push(`/trips/${trip.id}`);
    } else {
      alert('Error al crear viaje');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-coral/10 via-sun/5 to-mint/10">
      <div className="bg-surface dark:bg-surface-dark rounded-3xl p-8 max-w-lg w-full shadow-2xl">
        <Link href="/trips" className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink mb-6">
          <ChevronLeft size={16} /> Volver
        </Link>

        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral to-sun flex items-center justify-center">
            <Compass size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display text-2xl font-bold tracking-tight">Nuevo viaje</div>
            <div className="text-xs text-ink-muted">A dónde van esta vez?</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft block mb-2">Nombre</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Costa Rica · Pura Vida"
              className="w-full px-4 py-3 rounded-xl bg-bg dark:bg-bg-dark-alt border border-bg-alt dark:border-ink-soft/20 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft block mb-2">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {emojis.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-xl text-xl transition ${emoji === e ? 'bg-coral text-white scale-110' : 'bg-bg dark:bg-bg-dark-alt hover:scale-110'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft block mb-2">Desde</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-bg dark:bg-bg-dark-alt border border-bg-alt dark:border-ink-soft/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft block mb-2">Hasta</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-bg dark:bg-bg-dark-alt border border-bg-alt dark:border-ink-soft/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft block mb-2">Presupuesto</label>
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="Opcional"
                className="w-full px-4 py-3 rounded-xl bg-bg dark:bg-bg-dark-alt border border-bg-alt dark:border-ink-soft/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-soft block mb-2">Moneda</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-bg dark:bg-bg-dark-alt border border-bg-alt dark:border-ink-soft/20"
              >
                {['USD','EUR','MXN','COP','ARS','CLP','PEN','BRL','GBP'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <button onClick={submit} disabled={loading || !name || !startDate || !endDate} className="btn-coral w-full disabled:opacity-50 mt-2">
            {loading ? 'Creando...' : 'Crear viaje'}
          </button>
        </div>
      </div>
    </div>
  );
}
