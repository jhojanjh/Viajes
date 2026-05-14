import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/getAuth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getAuth();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text, assigneeId } = await req.json();
  const item = await prisma.checklistItem.create({
    data: { tripId: params.id, text, assigneeId: assigneeId || null },
    include: { assignee: true },
  });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getAuth();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { itemId, done } = await req.json();
  const item = await prisma.checklistItem.update({
    where: { id: itemId },
    data: { done },
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getAuth();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { itemId } = await req.json();
  await prisma.checklistItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
