'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, Users, Calendar, ArrowRight, Hash } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { fmt } from '@/lib/utils';

export function TripsClient({ trips }: { trips: any[] }) {
  const router = useRouter();
  const [joinOpen, setJoinOpen] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const join = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const res = await fetch('/api/trips/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.toUpperCase() }),
    });
    setLoading(false);
    if (res.ok) {
      const { trip } = await res.json();
      router.push(`/trips/${trip.id}`);
    } else {
      alert('Código inválido');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Tus viajes</h1>
          <p className="text-ink-soft dark:text-ink-dark-soft mt-2">
            {trips.length === 0 ? 'Empieza tu primera aventura' : `${trips.length} ${trips.length === 1 ? 'viaje' : 'viajes'} planeados`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setJoinOpen(true)} className="btn-ghost flex items-center gap-2 border border-bg-alt dark:border-ink-soft/20">
            <Hash size={15} /> Unirse con código
          </button>
          <Link href="/trips/new" className="btn-primary flex items-center gap-2">
            <Plus size={15} strokeWidth={2.5} /> Nuevo viaje
          </Link>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-coral to-sun flex items-center justify-center text-3xl">
            ✈️
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Tu primer viaje te espera</h2>
          <p className="text-ink-soft dark:text-ink-dark-soft mb-6 max-w-md mx-auto">
            Crea un viaje, invita a tus amigos y organicen gastos, itinerarios y reservas juntos.
          </p>
          <Link href="/trips/new" className="btn-coral inline-flex items-center gap-2">
            <Plus size={15} strokeWidth={2.5} /> Crear primer viaje
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trips.map(trip => (
            <Link
              key={trip.id}
              href={`/trips/${trip.id}`}
              className="card p-5 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-coral/20 to-sun/20 flex items-center justify-center text-2xl">
                  {trip.emoji}
                </div>
                <ArrowRight size={18} className="text-ink-muted" />
              </div>
              <h3 className="font-display text-xl font-bold tracking-tight mb-1.5 leading-tight">
                {trip.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-ink-soft dark:text-ink-dark-soft mb-4">
                <Calendar size={12} />
                {fmt.dateShort(trip.startDate)} – {fmt.dateShort(trip.endDate)}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-bg-alt dark:border-ink-soft/20">
                <div className="flex -space-x-2">
                  {trip.members.slice(0, 4).map((m: any) => (
                    <div key={m.id} className="ring-2 ring-surface dark:ring-surface-dark rounded-full">
                      <Avatar user={m.user} size={28} />
                    </div>
                  ))}
                  {trip.members.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-bg-alt dark:bg-bg-dark-alt ring-2 ring-surface dark:ring-surface-dark flex items-center justify-center text-[10px] font-semibold text-ink-soft">
                      +{trip.members.length - 4}
                    </div>
                  )}
                </div>
                <div className="text-xs text-ink-muted">
                  {trip._count.expenses} gastos
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {joinOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setJoinOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-surface dark:bg-surface-dark rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-display text-xl font-bold mb-1">Unirse a un viaje</h3>
            <p className="text-xs text-ink-soft mb-4">Ingresa el código de 6 caracteres que te compartieron</p>
            <input
              autoFocus
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="ABC123"
              className="w-full px-4 py-3 rounded-xl bg-bg dark:bg-bg-dark-alt border border-bg-alt dark:border-ink-soft/20 font-mono text-center text-2xl tracking-widest font-bold mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setJoinOpen(false)} className="btn-ghost flex-1 border border-bg-alt dark:border-ink-soft/20">Cancelar</button>
              <button onClick={join} disabled={loading || code.length < 4} className="btn-coral flex-1 disabled:opacity-50">
                {loading ? 'Buscando...' : 'Unirse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
