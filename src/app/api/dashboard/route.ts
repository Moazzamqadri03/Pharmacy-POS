// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const salesToday = await prisma.sale.count({ where: { createdAt: { gte: todayStart } } });
    const allMedicines = await prisma.medicine.count();
    const lowStock = await prisma.medicine.count({ where: { stock: { lte: 10 } } });
    const recentSales = await prisma.sale.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: { id: true, invoiceNo: true, customerName: true, grandTotal: true, createdAt: true },
    });
    const revenueToday = await prisma.sale.aggregate({
      where: { createdAt: { gte: todayStart } },
      _sum: { grandTotal: true },
    });

    return NextResponse.json({
      totalSalesToday: salesToday,
      totalRevenueToday: revenueToday._sum.grandTotal || 0,
      totalMedicines: allMedicines,
      lowStockCount: lowStock,
      recentSales,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      totalSalesToday: 0,
      totalRevenueToday: 0,
      totalMedicines: 0,
      lowStockCount: 0,
      recentSales: [],
      error: 'Failed to load dashboard',
    }, { status: 200 });
  }
}
