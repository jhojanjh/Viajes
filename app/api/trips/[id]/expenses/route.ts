import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  category: z.string().default('other'),
  occurredAt: z.string().optional(),
  splitWith: z.array(z.string()).min(1),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId: params.id, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = createSchema.parse(await req.json());
  const sharePerPerson = Math.round((body.amount / body.splitWith.length) * 100) / 100;

  const expense = await prisma.expense.create({
    data: {
      tripId: params.id,
      payerId: session.user.id,
      title: body.title,
      amount: body.amount,
      currency: body.currency,
      category: body.category,
      notes: body.notes,
      occurredAt: body.occurredAt ? new Date(body.occurredAt) : new Date(),
      shares: {
        create: body.splitWith.map(userId => ({ userId, amount: sharePerPerson })),
      },
    },
    include: { payer: true, shares: { include: { user: true } } },
  });

  return NextResponse.json(expense);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { expenseId } = await req.json();
  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense || expense.payerId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.expense.delete({ where: { id: expenseId } });
  return NextResponse.json({ ok: true });
}
