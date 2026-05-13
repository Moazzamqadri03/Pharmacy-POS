// src/app/api/medicines/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    const medicines = await prisma.medicine.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q } },
              { category: { contains: q } },
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(medicines);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, price, stock, gstRate, purchasePrice, unitsPurchased } = body;

    if (!name || price == null || stock == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        category: category || 'General',
        price: Number(price),
        stock: Number(stock),
        gstRate: Number(gstRate ?? 5),
        purchasePrice: purchasePrice ? Number(purchasePrice) : null,
        unitsPurchased: unitsPurchased ? Number(unitsPurchased) : null
      },
    });

    return NextResponse.json(medicine, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create medicine' }, { status: 500 });
  }
}
