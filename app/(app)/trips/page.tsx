import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/AppShell';
import { TripsClient } from './TripsClient';

export default async function TripsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const trips = await prisma.trip.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      members: { include: { user: true } },
      _count: { select: { expenses: true } },
    },
    orderBy: { startDate: 'asc' },
  });

  return (
    <AppShell>
      <TripsClient trips={JSON.parse(JSON.stringify(trips))} />
    </AppShell>
  );
}
