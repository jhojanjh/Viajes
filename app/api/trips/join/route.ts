import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

  const trip = await prisma.trip.findUnique({ where: { code: code.toUpperCase() } });
  if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

  const existing = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId: trip.id, userId: token.id as string } },
  });
  if (existing) return NextResponse.json({ trip });

  await prisma.tripMember.create({
    data: { tripId: trip.id, userId: token.id as string, role: 'MEMBER' },
  });

  return NextResponse.json({ trip });
}
