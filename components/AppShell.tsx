'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Compass, Home, Wallet, Calendar, ListChecks, FileText, MessageCircle,
  Sun, Moon, LogOut, ChevronLeft, ArrowLeftRight, Menu, X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar } from './Avatar';

export function AppShell({ children, tripId }: { children: React.ReactNode; tripId?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'resumen';
  const { data: session } = useSession();
  const [dark, setDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const sections = tripId ? [
    { href: `/trips/${tripId}`, label: 'Resumen', icon: Home, tab: 'resumen' },
  ] : [
    { href: '/trips', label: 'Mis viajes', icon: Compass, match: (p: string) => p.startsWith('/trips') },
  ];

  const mobileNav = tripId ? [
    { href: `/trips/${tripId}`, label: 'Resumen', icon: Home, tab: 'resumen' },
    { href: `/trips/${tripId}?tab=gastos`, label: 'Gastos', icon: Wallet, tab: 'gastos' },
    { href: `/trips/${tripId}?tab=itinerario`, label: 'Itinerario', icon: Calendar, tab: 'itinerario' },
    { href: `/trips/${tripId}?tab=equipaje`, label: 'Equipaje', icon: ListChecks, tab: 'equipaje' },
    { href: `/trips/${tripId}?tab=chat`, label: 'Chat', icon: MessageCircle, tab: 'chat' },
  ] : [];

  return (
    <div className="flex min-h-screen font-sans">

      {/* ── Mobile top header ── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 bg-surface/95 dark:bg-surface-dark/95 backdrop-blur border-b border-bg-alt dark:border-ink-soft/20 flex items-center px-4 h-14">
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-ink dark:text-ink-dark">
          <Menu size={22} />
        </button>
        <div className="flex-1 flex justify-center">
          <span className="font-display font-bold text-base">Viajesito ❤️</span>
        </div>
        <div className="w-10" />
      </header>

      {/* ── Mobile drawer ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute left-0 top-0 bottom-0 w-72 bg-surface dark:bg-surface-dark flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-bg-alt dark:border-ink-soft/20">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coral to-sun flex items-center justify-center shadow-md">
                <Compass size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <div className="font-display font-bold">Viajesito ❤️</div>
                <div className="text-[10px] text-ink-muted uppercase tracking-widest">Viaja con amigos</div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-ink-muted p-1">
                <X size={20} />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
              <Link
                href="/trips"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium hover:bg-bg-alt dark:hover:bg-bg-dark-alt transition"
              >
                <Compass size={18} className="text-coral" /> Mis viajes
              </Link>
              {tripId && (
                <Link
                  href={`/trips/${tripId}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium hover:bg-bg-alt dark:hover:bg-bg-dark-alt transition"
                >
                  <Home size={18} className="text-coral" /> Resumen del viaje
                </Link>
              )}
            </nav>

            {/* Bottom actions */}
            <div className="p-4 border-t border-bg-alt dark:border-ink-soft/20 flex flex-col gap-1">
              <button
                onClick={() => { toggle(); }}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm w-full text-left hover:bg-bg-alt dark:hover:bg-bg-dark-alt transition"
              >
                {dark ? <Sun size={18} className="text-sun" /> : <Moon size={18} className="text-ink-soft" />}
                {dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              </button>
              {session?.user && (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 mt-1">
                    <Avatar user={session.user} size={34} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{session.user.name}</div>
                      <div className="text-xs text-ink-muted truncate">{session.user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-coral w-full hover:bg-coral/10 transition"
                  >
                    <LogOut size={18} /> Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-64 flex-col bg-bg-alt dark:bg-bg-dark-alt border-r border-bg-alt dark:border-ink-soft/20 sticky top-0 h-screen p-4">
        <Link href="/trips" className="flex items-center gap-2.5 px-2 pb-5 mb-4 border-b border-ink-muted/15">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coral to-sun flex items-center justify-center shadow-lg shadow-coral/30">
            <Compass size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display text-lg font-bold tracking-tight">Viajesito ❤️</div>
            <div className="text-[10px] uppercase tracking-widest text-ink-muted">Viaja con amigos</div>
          </div>
        </Link>

        {tripId && (
          <Link href="/trips" className="flex items-center gap-2 text-xs text-ink-soft dark:text-ink-dark-soft hover:text-ink mb-3 px-2">
            <ChevronLeft size={14} /> Todos los viajes
          </Link>
        )}

        <nav className="flex flex-col gap-1">
          {sections.map(s => {
            const Icon = s.icon;
            const active = 'tab' in s ? currentTab === s.tab : pathname === s.href;
            return (
              <Link
                key={s.href}
                href={s.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                  active
                    ? 'bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark font-semibold shadow-sm'
                    : 'text-ink-soft dark:text-ink-dark-soft hover:bg-surface/50 dark:hover:bg-surface-dark/50'
                }`}
              >
                <Icon size={17} strokeWidth={active ? 2.4 : 2} />
                {s.label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-coral" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-ink-muted/15 flex flex-col gap-1">
          {tripId && (
            <Link href="/trips" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ink-soft dark:text-ink-dark-soft hover:bg-surface/50 dark:hover:bg-surface-dark/50">
              <ArrowLeftRight size={17} /> Cambiar viaje
            </Link>
          )}
          <button onClick={toggle} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ink-soft dark:text-ink-dark-soft hover:bg-surface/50 dark:hover:bg-surface-dark/50">
            {dark ? <Sun size={17} /> : <Moon size={17} />}
            {dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          </button>
          {session?.user && (
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar user={session.user} size={32} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{session.user.name}</div>
                <div className="text-[10px] text-ink-muted truncate">{session.user.email}</div>
              </div>
              <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-ink-muted hover:text-coral">
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      {tripId && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 dark:bg-surface-dark/95 backdrop-blur border-t border-bg-alt dark:border-ink-soft/20 flex items-center justify-around py-2 pb-safe">
          {mobileNav.map((s: { href: string; label: string; icon: any; tab: string }) => {
            const Icon = s.icon;
            const active = currentTab === s.tab;
            return (
              <Link key={s.href} href={s.href} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 ${active ? 'text-coral' : 'text-ink-muted'}`}>
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                <span className="text-[10px] font-medium">{s.label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      <main className="flex-1 min-w-0 pb-20 md:pb-0 pt-14 md:pt-0">{children}</main>
    </div>
  );
}
