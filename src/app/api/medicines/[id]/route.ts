// src/app/api/medicines/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();

    const medicine = await prisma.medicine.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
        price: Number(body.price),
        stock: Number(body.stock),
        gstRate: Number(body.gstRate),
        purchasePrice: body.purchasePrice ? Number(body.purchasePrice) : null,
        unitsPurchased: body.unitsPurchased ? Number(body.unitsPurchased) : null,
      },
    });

    return NextResponse.json(medicine);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update medicine' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await prisma.medicine.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete medicine' }, { status: 500 });
  }
}
