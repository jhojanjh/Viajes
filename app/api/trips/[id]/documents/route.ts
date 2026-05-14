import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, type, fileUrl, fileKey, fileSize } = await req.json();

  const doc = await prisma.document.create({
    data: {
      tripId: params.id,
      uploaderId: session.user.id,
      title, type, fileUrl, fileKey,
      fileSize: fileSize || 0,
    },
    include: { uploader: true },
  });
  return NextResponse.json(doc);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { docId } = await req.json();
  await prisma.document.delete({ where: { id: docId } });
  return NextResponse.json({ ok: true });
}
