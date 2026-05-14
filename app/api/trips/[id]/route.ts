import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/getAuth';
import { prisma } from '@/lib/prisma';

async function ensureMember(tripId: string, userId: string) {
  return prisma.tripMember.findUnique({ where: { tripId_userId: { tripId, userId } } });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getAuth();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await ensureMember(params.id, token.id as string);
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

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

  return NextResponse.json(trip);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getAuth();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await ensureMember(params.id, token.id as string);
  if (!member || member.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.trip.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
