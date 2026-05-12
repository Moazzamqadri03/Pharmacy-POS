// src/app/api/sales/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const sales = await prisma.sale.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(sales);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoiceNo, customerName, customerPhone, doctorName, discount, subtotal, cgst, sgst, grandTotal, items } = body;

    // Create sale + update stock in a transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Reduce stock for each item
      for (const item of items) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: item.qty } },
        });
      }

      // Create the sale record
      return tx.sale.create({
        data: {
          invoiceNo,
          customerName,
          customerPhone,
          doctorName,
          discount,
          subtotal,
          cgst,
          sgst,
          grandTotal,
          items: {
            create: items.map((i: any) => ({
              medicineId: i.medicineId,
              medicineName: i.medicineName,
              qty: i.qty,
              unitPrice: i.unitPrice,
              gstRate: i.gstRate,
              lineTotal: i.lineTotal,
            })),
          },
        },
        include: { items: true },
      });
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Failed to save sale' }, { status: 500 });
  }
}
