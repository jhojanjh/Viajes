import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/getAuth';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getAuth();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const messages = await prisma.chatMessage.findMany({
    where: { tripId: params.id },
    include: { author: true },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getAuth();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: 'Empty' }, { status: 400 });

  const msg = await prisma.chatMessage.create({
    data: { tripId: params.id, authorId: token.id as string, text: text.trim() },
    include: { author: true },
  });
  return NextResponse.json(msg);
}
