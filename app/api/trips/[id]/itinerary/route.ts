import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/getAuth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSchema = z.object({
  date: z.string(),
  time: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().default('activity'),
  location: z.string().optional(),
  mapsLink: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getAuth();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId: params.id, userId: token.id as string } },
  });
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = createSchema.parse(await req.json());
  const dayDate = new Date(body.date);
  dayDate.setHours(0, 0, 0, 0);

  const day = await prisma.itineraryDay.upsert({
    where: { tripId_date: { tripId: params.id, date: dayDate } },
    create: { tripId: params.id, date: dayDate },
    update: {},
  });

  const event = await prisma.itineraryEvent.create({
    data: {
      dayId: day.id,
      time: body.time,
      title: body.title,
      description: body.description,
      category: body.category,
      location: body.location,
      mapsLink: body.mapsLink,
    },
  });

  return NextResponse.json(event);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getAuth();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { eventId, time, title, description, category, location, mapsLink } = await req.json();
  const event = await prisma.itineraryEvent.update({
    where: { id: eventId },
    data: { time, title, description, category, location, mapsLink },
  });
  return NextResponse.json(event);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getAuth();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { eventId } = await req.json();
  await prisma.itineraryEvent.delete({ where: { id: eventId } });
  return NextResponse.json({ ok: true });
}
