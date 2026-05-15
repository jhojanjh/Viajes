'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Compass, Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError('Email o contraseña incorrectos');
    } else {
      router.push('/trips');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-coral via-orange-400 to-sun relative overflow-hidden">
      <div className="absolute top-20 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-20 -right-32 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />
      <div className="absolute top-10 right-20 text-white/20 text-9xl font-display italic">✦</div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coral to-sun flex items-center justify-center shadow-lg shadow-coral/30">
              <Compass size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display text-2xl font-bold tracking-tight">Viajesito ❤️</div>
              <div className="text-[10px] uppercase tracking-widest text-ink-muted">Viaja con amigos</div>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight mt-7 mb-2 leading-tight">
            Bienvenido de vuelta
          </h1>
          <p className="text-sm text-ink-soft mb-6">
            Inicia sesión para gestionar tus viajes
          </p>

          <form onSubmit={submit} className="space-y-3">
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg border border-bg-alt focus:border-coral focus:outline-none transition"
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg border border-bg-alt focus:border-coral focus:outline-none transition"
              />
            </div>

            {error && (
              <div className="text-xs text-coral bg-coral/10 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-ink text-white px-5 py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Entrando...' : (
                <>
                  Iniciar sesión
                  <ArrowRight size={15} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-bg-alt text-center text-sm text-ink-soft">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-coral font-semibold hover:underline">
              Regístrate gratis
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-ink-muted">
            <Sparkles size={12} className="text-coral" />
            Splitwise + Notion + Wanderlog en uno
          </div>
        </div>

        <div className="text-center mt-6 text-white/80 text-xs">
          Al continuar aceptas los términos de uso
        </div>
      </div>
    </div>
  );
}
