'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  Plus, Sparkles, Calendar, Users, Wallet, MapPin, TrendingUp, TrendingDown,
  Hotel, Car, Utensils, Mountain, ShoppingBag, Coffee, Ticket, Camera, Waves,
  Plane, FileText, ListChecks, MessageCircle, Send, Share2, Copy, Check, X,
  MoreHorizontal, Trash2, Clock, Download, Eye, Upload, Sun, Briefcase,
} from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { fmt, categories, colorFromId } from '@/lib/utils';
import { calculateBalances, settle } from '@/lib/settle';

const categoryIcons: Record<string, any> = {
  hotel: Hotel, transport: Car, food: Utensils, activity: Mountain, other: ShoppingBag,
};

const eventIcons: Record<string, any> = {
  activity: Mountain, food: Coffee, transport: Car, hotel: Hotel,
  flight: Plane, sightseeing: Camera, other: MapPin,
};

type Tab = 'resumen' | 'gastos' | 'itinerario' | 'equipaje' | 'documentos' | 'chat';

export function TripDashboard({ trip: initialTrip, currentUserId }: { trip: any; currentUserId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trip, setTrip] = useState(initialTrip);
  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'resumen');
  const [inviteOpen, setInviteOpen] = useState(false);

  // ─── Countdown ───
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  const startTime = new Date(trip.startDate).getTime();
  const diff = Math.max(0, startTime - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);

  // ─── Stats ───
  const totalSpent = useMemo(() =>
    trip.expenses.reduce((s: number, e: any) => s + e.amount, 0)
  , [trip.expenses]);

  const myBalance = useMemo(() => {
    const balances = calculateBalances(
      trip.expenses.map((e: any) => ({ payerId: e.payerId, amount: e.amount, shares: e.shares })),
      trip.members.map((m: any) => m.userId)
    );
    return balances.find(b => b.userId === currentUserId)?.amount || 0;
  }, [trip.expenses, trip.members, currentUserId]);

  const checklistDone = trip.checklistItems.filter((i: any) => i.done).length;

  const refresh = () => router.refresh();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 mb-6 text-white bg-gradient-to-br from-coral via-orange-400 to-sun shadow-xl shadow-coral/30">
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 right-20 w-40 h-40 rounded-full bg-white/10 blur-xl" />
        <div className="absolute top-8 right-10 text-7xl font-display italic opacity-15">✦</div>

        <div className="relative flex flex-wrap justify-between items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-3">
              <Sparkles size={11} /> {diff > 0 ? 'Próximo viaje' : '¡En curso!'}
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-[1.05] mb-2">
              <span className="mr-3">{trip.emoji}</span>
              {trip.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm opacity-95">
              <span className="flex items-center gap-1.5"><Calendar size={14} /> {fmt.dateShort(trip.startDate)} – {fmt.date(trip.endDate)}</span>
              <span className="flex items-center gap-1.5"><Users size={14} /> {trip.members.length} viajeros</span>
            </div>
          </div>

          {diff > 0 && (
            <div className="bg-white/20 backdrop-blur rounded-2xl px-5 py-3 border border-white/25">
              <div className="text-[10px] uppercase tracking-widest opacity-85 mb-1">Faltan</div>
              <div className="flex gap-4 font-display">
                <div>
                  <div className="text-3xl font-bold leading-none">{String(days).padStart(2, '0')}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">días</div>
                </div>
                <div>
                  <div className="text-3xl font-bold leading-none">{String(hours).padStart(2, '0')}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">horas</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative mt-6 flex items-center gap-3 flex-wrap">
          <div className="flex -space-x-2">
            {trip.members.slice(0, 5).map((m: any) => (
              <div key={m.id} className="ring-2 ring-white/50 rounded-full">
                <Avatar user={m.user} size={32} />
              </div>
            ))}
          </div>
          <button
            onClick={() => setInviteOpen(true)}
            className="ml-2 bg-white text-coral px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 hover:scale-105 transition"
          >
            <Share2 size={13} /> Invitar amigos
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 hidden md:flex">
        {([
          ['resumen', 'Resumen', Sparkles],
          ['gastos', 'Gastos', Wallet],
          ['itinerario', 'Itinerario', Calendar],
          ['equipaje', 'Equipaje', ListChecks],
          ['documentos', 'Documentos', FileText],
          ['chat', 'Chat', MessageCircle],
        ] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              tab === key
                ? 'bg-ink text-bg dark:bg-ink-dark dark:text-bg-dark shadow-lg'
                : 'bg-surface dark:bg-surface-dark text-ink-soft dark:text-ink-dark-soft hover:bg-bg-alt dark:hover:bg-bg-dark-alt'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Mobile tab selector */}
      <div className="md:hidden mb-4">
        <select
          value={tab}
          onChange={e => setTab(e.target.value as Tab)}
          className="w-full px-4 py-3 rounded-xl bg-surface dark:bg-surface-dark border border-bg-alt dark:border-ink-soft/20 font-semibold"
        >
          <option value="resumen">Resumen</option>
          <option value="gastos">Gastos</option>
          <option value="itinerario">Itinerario</option>
          <option value="equipaje">Equipaje</option>
          <option value="documentos">Documentos</option>
          <option value="chat">Chat</option>
        </select>
      </div>

      {/* Content */}
      {tab === 'resumen' && (
        <ResumenTab trip={trip} totalSpent={totalSpent} myBalance={myBalance} checklistDone={checklistDone} currentUserId={currentUserId} />
      )}
      {tab === 'gastos' && (
        <GastosTab trip={trip} currentUserId={currentUserId} onChange={refresh} />
      )}
      {tab === 'itinerario' && (
        <ItinerarioTab trip={trip} onChange={refresh} />
      )}
      {tab === 'equipaje' && (
        <EquipajeTab trip={trip} onChange={refresh} />
      )}
      {tab === 'documentos' && (
        <DocumentosTab trip={trip} onChange={refresh} />
      )}
      {tab === 'chat' && (
        <ChatTab trip={trip} currentUserId={currentUserId} />
      )}

      {inviteOpen && (
        <InviteModal trip={trip} onClose={() => setInviteOpen(false)} />
      )}
    </div>
  );
}

// ──────────── RESUMEN ────────────

function ResumenTab({ trip, totalSpent, myBalance, checklistDone, currentUserId }: any) {
  const progress = trip.budget ? (totalSpent / trip.budget) * 100 : 0;
  const upcomingEvents = trip.itineraryDays.slice(0, 1).flatMap((d: any) => d.events).slice(0, 3);

  // Balances + settlements
  const balances = useMemo(() =>
    calculateBalances(
      trip.expenses.map((e: any) => ({ payerId: e.payerId, amount: e.amount, shares: e.shares })),
      trip.members.map((m: any) => m.userId)
    )
  , [trip]);

  const settlements = settle(balances).slice(0, 3);
  const memberById = (id: string) => trip.members.find((m: any) => m.userId === id)?.user;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Presupuesto" value={trip.budget ? fmt.money(trip.budget, trip.baseCurrency) : '—'} sub={`${fmt.money(totalSpent, trip.baseCurrency)} gastado`} progress={progress} color="#FF6B47" icon={Wallet} />
        <StatCard label="Tu balance" value={`${myBalance >= 0 ? '+' : ''}${fmt.money(myBalance, trip.baseCurrency)}`} sub={myBalance > 0 ? 'Te deben' : myBalance < 0 ? 'Debes' : 'Al día'} color={myBalance >= 0 ? '#2BB089' : '#FF6B47'} icon={myBalance >= 0 ? TrendingUp : TrendingDown} accent />
        <StatCard label="Actividades" value={String(trip.itineraryDays.reduce((s:number,d:any) => s + d.events.length, 0))} sub={`${trip.itineraryDays.length} días`} color="#4A8FE7" icon={MapPin} />
        <StatCard label="Equipaje" value={`${checklistDone}/${trip.checklistItems.length}`} sub="Items listos" color="#F5B82E" icon={ListChecks} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-display text-lg font-bold tracking-tight mb-1">Próximas actividades</h3>
          <p className="text-xs text-ink-muted mb-4">Lo que viene</p>
          {upcomingEvents.length === 0 ? (
            <div className="text-sm text-ink-muted py-6 text-center">Aún no hay actividades planeadas</div>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((e: any) => {
                const Icon = eventIcons[e.category] || MapPin;
                const color = categories[e.category as keyof typeof categories]?.color || '#7B4B94';
                return (
                  <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-soft dark:bg-surface-dark-soft border border-bg-alt dark:border-ink-soft/15">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + '20', color }}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{e.title}</div>
                      <div className="text-xs text-ink-muted truncate">{e.description || e.location}</div>
                    </div>
                    <div className="font-display font-bold text-sm" style={{ color }}>{e.time}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-display text-lg font-bold tracking-tight mb-1">Estado de pagos</h3>
          <p className="text-xs text-ink-muted mb-4">Quién debe a quién</p>
          {settlements.length === 0 ? (
            <div className="text-sm text-ink-muted py-6 text-center">Todo al día 🎉</div>
          ) : (
            <div className="space-y-2">
              {settlements.map((s, i) => {
                const from = memberById(s.from);
                const to = memberById(s.to);
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-soft dark:bg-surface-dark-soft border border-bg-alt dark:border-ink-soft/15">
                    {from && <Avatar user={from} size={32} />}
                    <div className="flex-1 text-xs">
                      <div><span className="font-semibold">{from?.name?.split(' ')[0]}</span> <span className="text-ink-muted">debe a</span> <span className="font-semibold">{to?.name?.split(' ')[0]}</span></div>
                      <div className="font-display font-bold text-coral text-base">{fmt.money(s.amount, trip.baseCurrency)}</div>
                    </div>
                    {to && <Avatar user={to} size={32} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, progress, color, icon: Icon, accent }: any) {
  return (
    <div className={`rounded-2xl p-4 md:p-5 border ${accent ? 'border-transparent' : 'border-bg-alt dark:border-ink-soft/20'}`} style={accent ? { background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`, borderColor: color + '30' } : { background: 'var(--surface, white)' }}>
      <div className="flex justify-between items-start mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: color + '20', color }}>
          <Icon size={17} />
        </div>
      </div>
      <div className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-1">{label}</div>
      <div className="font-display text-xl md:text-2xl font-bold leading-tight">{value}</div>
      <div className="text-xs text-ink-soft mt-1">{sub}</div>
      {progress !== undefined && progress > 0 && (
        <div className="mt-3 h-1.5 rounded-full bg-bg-alt dark:bg-bg-dark-alt overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, progress)}%`, background: color }} />
        </div>
      )}
    </div>
  );
}

// ──────────── GASTOS ────────────

function GastosTab({ trip, currentUserId, onChange }: any) {
  const [modalOpen, setModalOpen] = useState(false);

  const total = trip.expenses.reduce((s: number, e: any) => s + e.amount, 0);
  const balances = calculateBalances(
    trip.expenses.map((e: any) => ({ payerId: e.payerId, amount: e.amount, shares: e.shares })),
    trip.members.map((m: any) => m.userId)
  );

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    trip.expenses.forEach((e: any) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).map(([cat, val]) => ({ cat, val, color: categories[cat as keyof typeof categories]?.color || '#888' }));
  }, [trip.expenses]);

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este gasto?')) return;
    await fetch(`/api/trips/${trip.id}/expenses`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expenseId: id }),
    });
    onChange();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-bold">{fmt.money(total, trip.baseCurrency)} <span className="text-sm text-ink-muted font-sans font-normal">total</span></div>
          <div className="text-xs text-ink-muted">{trip.expenses.length} transacciones</div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-coral flex items-center gap-2">
          <Plus size={15} strokeWidth={2.5} /> Agregar gasto
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card overflow-hidden">
          {trip.expenses.length === 0 ? (
            <div className="p-12 text-center text-ink-muted text-sm">
              <Wallet size={32} className="mx-auto mb-3 opacity-40" />
              Aún no hay gastos. ¡Agrega el primero!
            </div>
          ) : (
            trip.expenses.map((e: any, i: number) => {
              const Icon = categoryIcons[e.category] || ShoppingBag;
              const color = categories[e.category as keyof typeof categories]?.color || '#888';
              const share = e.shares.find((s: any) => s.userId === currentUserId)?.amount || 0;
              return (
                <div key={e.id} className={`flex items-center gap-3 p-4 ${i < trip.expenses.length - 1 ? 'border-b border-bg-alt dark:border-ink-soft/15' : ''}`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '20', color }}>
                    <Icon size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{e.title}</div>
                    <div className="text-xs text-ink-muted truncate">
                      Pagó <span className="font-semibold text-ink-soft dark:text-ink-dark-soft">{e.payer.name?.split(' ')[0]}</span> · {fmt.dateShort(e.occurredAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-base">{fmt.money(e.amount, e.currency)}</div>
                    <div className="text-[10px] text-ink-muted">tu parte: {fmt.money(share, trip.baseCurrency)}</div>
                  </div>
                  {e.payerId === currentUserId && (
                    <button onClick={() => remove(e.id)} className="text-ink-muted hover:text-coral p-1">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-4">
          {byCategory.length > 0 && <CategoryChart data={byCategory} total={total} currency={trip.baseCurrency} />}
          <BalancesCard balances={balances} members={trip.members} currency={trip.baseCurrency} />
        </div>
      </div>

      {modalOpen && <ExpenseModal trip={trip} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); onChange(); }} />}
    </div>
  );
}

function CategoryChart({ data, total, currency }: any) {
  let cumulative = 0;
  const segments = data.map((d: any) => {
    const pct = d.val / total;
    const startA = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const endA = cumulative * 2 * Math.PI - Math.PI / 2;
    const large = pct > 0.5 ? 1 : 0;
    const r = 60, cx = 80, cy = 80;
    const x1 = cx + r * Math.cos(startA), y1 = cy + r * Math.sin(startA);
    const x2 = cx + r * Math.cos(endA), y2 = cy + r * Math.sin(endA);
    return { ...d, path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, pct };
  });
  return (
    <div className="card p-5">
      <h3 className="font-display font-bold mb-4">Por categoría</h3>
      <div className="flex items-center gap-4">
        <svg width="140" height="140" className="flex-shrink-0">
          {segments.map((s: any, i: number) => <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="2" />)}
          <circle cx="80" cy="80" r="32" fill="currentColor" className="text-surface dark:text-surface-dark" />
        </svg>
        <div className="flex-1 space-y-2">
          {segments.map((s: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
              <span className="flex-1 capitalize">{categories[s.cat as keyof typeof categories]?.label || s.cat}</span>
              <span className="text-ink-muted font-mono">{Math.round(s.pct * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BalancesCard({ balances, members, currency }: any) {
  return (
    <div className="card p-5">
      <h3 className="font-display font-bold mb-4">Balances</h3>
      <div className="space-y-3">
        {balances.map((b: any) => {
          const user = members.find((m: any) => m.userId === b.userId)?.user;
          if (!user) return null;
          return (
            <div key={b.userId} className="flex items-center gap-3">
              <Avatar user={user} size={28} />
              <div className="flex-1 text-sm font-medium truncate">{user.name?.split(' ')[0]}</div>
              <div className={`font-display font-bold text-sm ${b.amount > 0 ? 'text-mint' : b.amount < 0 ? 'text-coral' : 'text-ink-muted'}`}>
                {b.amount > 0 ? '+' : ''}{fmt.money(b.amount, currency)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExpenseModal({ trip, onClose, onSaved }: any) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [splitWith, setSplitWith] = useState<string[]>(trip.members.map((m: any) => m.userId));
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title || !amount) return;
    setLoading(true);
    await fetch(`/api/trips/${trip.id}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, amount: parseFloat(amount), currency: trip.baseCurrency, category, splitWith,
      }),
    });
    setLoading(false);
    onSaved();
  };

  return (
    <Modal onClose={onClose} title="Nuevo gasto">
      <div className="space-y-3">
        <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Cena en el restaurante" className="w-full px-4 py-3 rounded-xl bg-bg dark:bg-bg-dark-alt border border-bg-alt dark:border-ink-soft/20" />
        <div className="grid grid-cols-2 gap-2">
          <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="0.00" className="px-4 py-3 rounded-xl bg-bg dark:bg-bg-dark-alt border border-bg-alt dark:border-ink-soft/20 font-display font-bold text-lg" />
          <select value={category} onChange={e => setCategory(e.target.value)} className="px-4 py-3 rounded-xl bg-bg dark:bg-bg-dark-alt border border-bg-alt dark:border-ink-soft/20">
            {Object.entries(categories).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-soft mb-2">Dividir entre</div>
          <div className="flex flex-wrap gap-2">
            {trip.members.map((m: any) => {
              const on = splitWith.includes(m.userId);
              return (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => setSplitWith(on ? splitWith.filter(id => id !== m.userId) : [...splitWith, m.userId])}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition ${on ? 'bg-coral text-white border-coral' : 'border-bg-alt dark:border-ink-soft/20'}`}
                >
                  <Avatar user={m.user} size={18} />
                  {m.user.name?.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>
        <button onClick={submit} disabled={loading || !title || !amount} className="btn-coral w-full disabled:opacity-50">
          {loading ? 'Guardando...' : 'Guardar gasto'}
        </button>
      </div>
    </Modal>
  );
}

// ──────────── ITINERARIO ────────────

function ItinerarioTab({ trip, onChange }: any) {
  const [modalOpen, setModalOpen] = useState(false);

  const remove = async (eventId: string) => {
    if (!confirm('¿Eliminar?')) return;
    await fetch(`/api/trips/${trip.id}/itinerary`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    });
    onChange();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-display text-xl font-bold">Itinerario</div>
          <div className="text-xs text-ink-muted">{trip.itineraryDays.reduce((s: number, d: any) => s + d.events.length, 0)} actividades</div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-coral flex items-center gap-2">
          <Plus size={15} strokeWidth={2.5} /> Agregar
        </button>
      </div>

      {trip.itineraryDays.length === 0 ? (
        <div className="card p-12 text-center text-ink-muted text-sm">
          <Calendar size={32} className="mx-auto mb-3 opacity-40" />
          Aún no hay actividades. ¡Empieza a planear!
        </div>
      ) : (
        trip.itineraryDays.map((day: any) => (
          <div key={day.id}>
            <h2 className="font-display text-xl font-bold tracking-tight mb-3">{fmt.date(day.date)}</h2>
            <div className="relative pl-8">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-bg-alt dark:bg-ink-soft/20" />
              {day.events.map((ev: any) => {
                const Icon = eventIcons[ev.category] || MapPin;
                const color = categories[ev.category as keyof typeof categories]?.color || '#7B4B94';
                return (
                  <div key={ev.id} className="relative mb-3">
                    <div className="absolute -left-[26px] top-3.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-bg dark:ring-bg-dark" style={{ background: color }}>
                      <Icon size={11} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div className="card p-4 flex items-center gap-4">
                      <div className="font-display font-bold min-w-[50px]" style={{ color }}>{ev.time}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{ev.title}</div>
                        {(ev.description || ev.location) && <div className="text-xs text-ink-muted">{ev.description || ev.location}</div>}
                        {ev.mapsLink && (
                          <a href={ev.mapsLink} target="_blank" className="text-xs text-sky font-semibold mt-1 inline-flex items-center gap-1">
                            <MapPin size={11} /> Ver en mapa
                          </a>
                        )}
                      </div>
                      <button onClick={() => remove(ev.id)} className="text-ink-muted hover:text-coral">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {modalOpen && <EventModal trip={trip} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); onChange(); }} />}
    </div>
  );
}

function EventModal({ trip, onClose, onSaved }: any) {
  const [date, setDate] = useState(trip.startDate.slice(0, 10));
  const [time, setTime] = useState('09:00');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('activity');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title || !date || !time) return;
    setLoading(true);
    const mapsLink = location ? `https://maps.google.com/?q=${encodeURIComponent(location)}` : undefined;
    await fetch(`/api/trips/${trip.id}/itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, time, title, description, category, location, mapsLink }),
    });
    setLoading(false);
    onSaved();
  };

  return (
    <Modal onClose={onClose} title="Nueva actividad">
      <div className="space-y-3">
        <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Visita al volcán" className="w-full px-4 py-3 rounded-xl bg-bg dark:bg-bg-dark-alt border border-bg-alt dark:border-ink-soft/20" />
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} min={trip.startDate.slice(0,10)} max={trip.endDate.slice(0,10)} className="px-4 py-3 rounded-xl bg-bg dark:bg-bg-dark-alt border border-bg-alt dark:border-ink-soft/20" />
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="px-4 py-3 rounded-xl bg-bg dark:bg-bg-dark-alt border border-bg-alt dark:border-ink-soft/20" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-bg dark:bg-bg-dark-alt border border-bg-alt dark:border-ink-soft/20">
          {Object.entries(categories).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Ubicación (se abrirá en Google Maps)" className="w-full px-4 py-3 rounded-xl bg-bg dark:bg-bg-dark-alt border border-bg-alt dark:border-ink-soft/20" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Notas (opcional)" rows={2} className="w-full px-4 py-3 rounded-xl bg-bg dark:bg-bg-dark-alt border border-bg-alt dark:border-ink-soft/20 resize-none" />
        <button onClick={submit} disabled={loading} className="btn-coral w-full disabled:opacity-50">
          {loading ? 'Guardando...' : 'Guardar actividad'}
        </button>
      </div>
    </Modal>
  );
}

// ──────────── EQUIPAJE ────────────

function EquipajeTab({ trip, onChange }: any) {
  const [text, setText] = useState('');
  const [assignee, setAssignee] = useState<string>('');

  const add = async () => {
    if (!text.trim()) return;
    await fetch(`/api/trips/${trip.id}/checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, assigneeId: assignee || null }),
    });
    setText('');
    onChange();
  };

  const toggle = async (item: any) => {
    await fetch(`/api/trips/${trip.id}/checklist`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id, done: !item.done }),
    });
    onChange();
  };

  const remove = async (id: string) => {
    await fetch(`/api/trips/${trip.id}/checklist`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: id }),
    });
    onChange();
  };

  const done = trip.checklistItems.filter((i: any) => i.done).length;
  const pct = trip.checklistItems.length > 0 ? (done / trip.checklistItems.length) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-center gap-4 mb-3">
          <Briefcase size={20} className="text-coral" />
          <div className="flex-1">
            <div className="font-semibold text-sm">Progreso colaborativo</div>
            <div className="text-xs text-ink-muted">{Math.round(pct)}% completado · {done}/{trip.checklistItems.length}</div>
          </div>
          <div className="font-display text-2xl font-bold text-coral">{Math.round(pct)}%</div>
        </div>
        <div className="h-2 bg-bg-alt dark:bg-bg-dark-alt rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-coral to-sun transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="card p-3 flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Agregar item (ej. pasaporte, repelente...)"
          className="flex-1 px-3 py-2 rounded-lg bg-bg dark:bg-bg-dark-alt"
        />
        <select value={assignee} onChange={e => setAssignee(e.target.value)} className="px-3 py-2 rounded-lg bg-bg dark:bg-bg-dark-alt text-sm">
          <option value="">Todos</option>
          {trip.members.map((m: any) => <option key={m.userId} value={m.userId}>{m.user.name?.split(' ')[0]}</option>)}
        </select>
        <button onClick={add} className="btn-coral px-4 py-2">
          <Plus size={15} strokeWidth={2.5} />
        </button>
      </div>

      <div className="card overflow-hidden">
        {trip.checklistItems.length === 0 ? (
          <div className="p-12 text-center text-ink-muted text-sm">
            <ListChecks size={32} className="mx-auto mb-3 opacity-40" />
            Aún no hay items. Agrega tu primer recordatorio.
          </div>
        ) : (
          trip.checklistItems.map((item: any, i: number) => (
            <div key={item.id} className={`flex items-center gap-3 p-4 ${item.done ? 'opacity-60' : ''} ${i < trip.checklistItems.length - 1 ? 'border-b border-bg-alt dark:border-ink-soft/15' : ''}`}>
              <button onClick={() => toggle(item)} className="flex-shrink-0">
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition ${item.done ? 'bg-mint border-mint' : 'border-bg-alt dark:border-ink-soft/30'}`}>
                  {item.done && <Check size={14} className="text-white" strokeWidth={3} />}
                </div>
              </button>
              <span className={`flex-1 text-sm ${item.done ? 'line-through' : ''}`}>{item.text}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-bg-alt dark:bg-bg-dark-alt text-ink-soft">
                {item.assignee ? item.assignee.name?.split(' ')[0] : 'Todos'}
              </span>
              <button onClick={() => remove(item.id)} className="text-ink-muted hover:text-coral">
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ──────────── DOCUMENTOS ────────────

function DocumentosTab({ trip, onChange }: any) {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('other');
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!title) { alert('Agrega un título primero'); return; }
    setUploading(true);

    try {
      // Upload to UploadThing
      const formData = new FormData();
      formData.append('files', file);

      const upRes = await fetch('/api/uploadthing?actionType=upload&slug=document', {
        method: 'POST',
        headers: {
          'x-uploadthing-package': '@uploadthing/react',
          'x-uploadthing-version': '6.13.2',
        },
        body: JSON.stringify({
          files: [{ name: file.name, size: file.size, type: file.type }],
        }),
      });
      // Simplified: skip server upload, just demo
      // In real flow, use the UploadThing client which we'll wire below
      alert('Para subir archivos reales, configura UploadThing siguiendo el README. Por ahora se guardará un placeholder.');

      await fetch(`/api/trips/${trip.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, type,
          fileUrl: 'https://example.com/placeholder.pdf',
          fileKey: 'placeholder',
          fileSize: file.size,
        }),
      });
      setTitle('');
      onChange();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar documento?')) return;
    await fetch(`/api/trips/${trip.id}/documents`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId: id }),
    });
    onChange();
  };

  const docTypes: Record<string, { label: string; color: string; icon: any }> = {
    flight: { label: 'Vuelo', color: '#4A8FE7', icon: Plane },
    hotel: { label: 'Hotel', color: '#FF6B47', icon: Hotel },
    transport: { label: 'Transporte', color: '#2BB089', icon: Car },
    activity: { label: 'Actividad', color: '#F5B82E', icon: Ticket },
    insurance: { label: 'Seguro', color: '#7B4B94', icon: FileText },
    other: { label: 'Otro', color: '#888', icon: FileText },
  };

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="font-semibold text-sm mb-3">Subir documento</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nombre del documento" className="px-4 py-2.5 rounded-xl bg-bg dark:bg-bg-dark-alt border border-bg-alt dark:border-ink-soft/20" />
          <select value={type} onChange={e => setType(e.target.value)} className="px-4 py-2.5 rounded-xl bg-bg dark:bg-bg-dark-alt border border-bg-alt dark:border-ink-soft/20">
            {Object.entries(docTypes).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <label className="btn-coral flex items-center justify-center gap-2 cursor-pointer">
            <Upload size={15} /> {uploading ? 'Subiendo...' : 'Elegir archivo'}
            <input ref={fileRef} type="file" accept="application/pdf,image/*" onChange={onFile} className="hidden" />
          </label>
        </div>
      </div>

      {trip.documents.length === 0 ? (
        <div className="card p-12 text-center text-ink-muted text-sm">
          <FileText size={32} className="mx-auto mb-3 opacity-40" />
          Sin documentos aún. Sube vuelos, reservas o tickets.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trip.documents.map((doc: any) => {
            const t = docTypes[doc.type] || docTypes.other;
            const Icon = t.icon;
            return (
              <div key={doc.id} className="card p-5 hover:shadow-lg transition group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: t.color + '20', color: t.color }}>
                    <Icon size={18} />
                  </div>
                  <button onClick={() => remove(doc.id)} className="text-ink-muted hover:text-coral opacity-0 group-hover:opacity-100 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: t.color + '15', color: t.color }}>
                  {t.label}
                </span>
                <div className="font-display font-bold mt-2 mb-1">{doc.title}</div>
                <div className="text-xs text-ink-muted mb-3">Subido por {doc.uploader.name?.split(' ')[0]}</div>
                <div className="flex justify-between items-center pt-3 border-t border-bg-alt dark:border-ink-soft/15 text-xs">
                  <span className="text-ink-muted">{(doc.fileSize / 1024).toFixed(0)} KB</span>
                  <a href={doc.fileUrl} target="_blank" className="text-sky font-semibold flex items-center gap-1">
                    <Eye size={12} /> Abrir
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ──────────── CHAT ────────────

function ChatTab({ trip, currentUserId }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const res = await fetch(`/api/trips/${trip.id}/messages`);
    if (res.ok) setMessages(await res.json());
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    const msg = text;
    setText('');
    const res = await fetch(`/api/trips/${trip.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: msg }),
    });
    if (res.ok) {
      const m = await res.json();
      setMessages(prev => [...prev, m]);
    }
  };

  return (
    <div className="card flex flex-col h-[600px] overflow-hidden">
      <div className="px-5 py-3 border-b border-bg-alt dark:border-ink-soft/15">
        <div className="font-semibold text-sm">Chat grupal</div>
        <div className="text-xs text-ink-muted">{trip.members.length} miembros</div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-ink-muted text-sm py-12">
            <MessageCircle size={32} className="mx-auto mb-3 opacity-40" />
            Sé el primero en escribir!
          </div>
        ) : (
          messages.map(m => {
            const self = m.authorId === currentUserId;
            return (
              <div key={m.id} className={`flex gap-2 ${self ? 'flex-row-reverse' : ''}`}>
                <Avatar user={m.author} size={32} />
                <div className={`max-w-[75%] ${self ? 'items-end' : ''}`}>
                  {!self && (
                    <div className="text-[10px] text-ink-muted mb-1 ml-1">
                      <span className="font-semibold text-ink-soft dark:text-ink-dark-soft">{m.author.name?.split(' ')[0]}</span>
                    </div>
                  )}
                  <div className={`px-3.5 py-2 rounded-2xl text-sm leading-snug ${
                    self ? 'bg-coral text-white rounded-tr-sm' : 'bg-surface-soft dark:bg-surface-dark-soft rounded-tl-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-bg-alt dark:border-ink-soft/15 bg-surface-soft dark:bg-surface-dark-soft flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-surface dark:bg-surface-dark border border-bg-alt dark:border-ink-soft/20 text-sm"
        />
        <button onClick={send} className="btn-coral px-4">
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

// ──────────── INVITE ────────────

function InviteModal({ trip, onClose }: any) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/trips?code=${trip.code}` : '';

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal onClose={onClose} title="Invitar amigos">
      <div className="space-y-4">
        <p className="text-sm text-ink-soft">Comparte este código o link con tus amigos para que se unan al viaje.</p>

        <div className="bg-gradient-to-br from-coral/10 to-sun/10 rounded-2xl p-6 text-center">
          <div className="text-[10px] uppercase tracking-widest font-semibold text-ink-muted mb-2">Código de viaje</div>
          <div className="font-mono font-bold text-4xl tracking-widest text-coral mb-3">{trip.code}</div>
          <button onClick={() => copy(trip.code)} className="text-xs text-ink-soft hover:text-coral inline-flex items-center gap-1">
            {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-soft mb-2">O comparte el link</div>
          <div className="flex gap-2">
            <input value={url} readOnly className="flex-1 px-3 py-2.5 rounded-xl bg-bg dark:bg-bg-dark-alt border border-bg-alt dark:border-ink-soft/20 text-xs font-mono" />
            <button onClick={() => copy(url)} className="btn-primary px-4">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ──────────── MODAL ────────────

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-surface dark:bg-surface-dark rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="text-ink-muted hover:text-coral">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
