import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

  const trip = await prisma.trip.findUnique({ where: { code: code.toUpperCase() } });
  if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

  const existing = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId: trip.id, userId: session.user.id } },
  });
  if (existing) return NextResponse.json({ trip });

  await prisma.tripMember.create({
    data: { tripId: trip.id, userId: session.user.id, role: 'MEMBER' },
  });

  return NextResponse.json({ trip });
}
