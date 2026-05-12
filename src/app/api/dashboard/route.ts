// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [salesToday, allMedicines, lowStock, recentSales, revenueToday] = await Promise.all([
      prisma.sale.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.medicine.count(),
      prisma.medicine.count({ where: { stock: { lte: 10 } } }),
      prisma.sale.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: { id: true, invoiceNo: true, customerName: true, grandTotal: true, createdAt: true },
      }),
      prisma.sale.aggregate({
        where: { createdAt: { gte: todayStart } },
        _sum: { grandTotal: true },
      }),
    ]);

    return NextResponse.json({
      totalSalesToday: salesToday,
      totalRevenueToday: revenueToday._sum.grandTotal || 0,
      totalMedicines: allMedicines,
      lowStockCount: lowStock,
      recentSales,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
