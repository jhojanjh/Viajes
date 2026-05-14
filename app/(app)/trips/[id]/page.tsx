import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppShell } from '@/components/AppShell';
import { TripDashboard } from './TripDashboard';

export default async function TripPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const member = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId: params.id, userId: session.user.id } },
  });
  if (!member) notFound();

  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: {
      members: { include: { user: true } },
      expenses: { include: { payer: true, shares: { include: { user: true } } }, orderBy: { occurredAt: 'desc' } },
      itineraryDays: { include: { events: { orderBy: { time: 'asc' } } }, orderBy: { date: 'asc' } },
      checklistItems: { include: { assignee: true }, orderBy: { createdAt: 'asc' } },
      documents: { include: { uploader: true }, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!trip) notFound();

  return (
    <AppShell tripId={trip.id}>
      <TripDashboard
        trip={JSON.parse(JSON.stringify(trip))}
        currentUserId={session.user.id}
      />
    </AppShell>
  );
}
