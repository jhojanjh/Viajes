import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata = {
  title: 'TripSync — Viaja con amigos',
  description: 'Gestiona viajes, gastos e itinerarios con tus amigos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#FF6B47" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
