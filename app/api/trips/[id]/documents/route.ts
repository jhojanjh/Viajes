import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/getAuth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getAuth();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, type, fileUrl, fileKey, fileSize } = await req.json();

  const doc = await prisma.document.create({
    data: {
      tripId: params.id,
      uploaderId: token.id as string,
      title, type, fileUrl, fileKey,
      fileSize: fileSize || 0,
    },
    include: { uploader: true },
  });
  return NextResponse.json(doc);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getAuth();
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { docId } = await req.json();
  await prisma.document.delete({ where: { id: docId } });
  return NextResponse.json({ ok: true });
}
