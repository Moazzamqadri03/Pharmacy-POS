// src/lib/types.ts
export interface Medicine {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  gstRate: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  gstRate: number;
}

export interface SalePayload {
  invoiceNo: string;
  customerName?: string;
  customerPhone?: string;
  doctorName?: string;
  discount: number;
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  items: {
    medicineId: number;
    medicineName: string;
    qty: number;
    unitPrice: number;
    gstRate: number;
    lineTotal: number;
  }[];
}

export interface DashboardStats {
  totalSalesToday: number;
  totalRevenueToday: number;
  totalMedicines: number;
  lowStockCount: number;
  recentSales: {
    id: number;
    invoiceNo: string;
    customerName: string | null;
    grandTotal: number;
    createdAt: string;
  }[];
}
