import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { tripCode } from '@/lib/utils';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const trips = await prisma.trip.findMany({
    where: { members: { some: { userId: token.id as string } } },
    include: {
      members: { include: { user: true } },
      _count: { select: { expenses: true, itineraryDays: true } },
    },
    orderBy: { startDate: 'asc' },
  });

  return NextResponse.json(trips);
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  emoji: z.string().max(4).optional(),
  startDate: z.string(),
  endDate: z.string(),
  budget: z.number().nullable().optional(),
  baseCurrency: z.string().length(3).default('USD'),
});

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = createSchema.parse(await req.json());

  const trip = await prisma.trip.create({
    data: {
      name: body.name,
      emoji: body.emoji || '✈️',
      code: tripCode(),
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      budget: body.budget ?? null,
      baseCurrency: body.baseCurrency,
      members: { create: { userId: token.id as string, role: 'ADMIN' } },
    },
  });

  return NextResponse.json(trip);
}
