// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const medicines = [
  { name: "Paracetamol 500mg",    category: "Analgesic",        price: 28.00,  stock: 200, gstRate: 5  },
  { name: "Amoxicillin 500mg",    category: "Antibiotic",       price: 85.50,  stock: 80,  gstRate: 12 },
  { name: "Omeprazole 20mg",      category: "Antacid",          price: 42.00,  stock: 120, gstRate: 5  },
  { name: "Metformin 500mg",      category: "Antidiabetic",     price: 55.00,  stock: 150, gstRate: 5  },
  { name: "Cetirizine 10mg",      category: "Antihistamine",    price: 22.00,  stock: 300, gstRate: 5  },
  { name: "Azithromycin 500mg",   category: "Antibiotic",       price: 110.00, stock: 60,  gstRate: 12 },
  { name: "Aspirin 75mg",         category: "Antiplatelet",     price: 18.50,  stock: 400, gstRate: 5  },
  { name: "Ranitidine 150mg",     category: "Antacid",          price: 35.00,  stock: 8,   gstRate: 5  },
  { name: "Ibuprofen 400mg",      category: "Analgesic",        price: 32.00,  stock: 180, gstRate: 5  },
  { name: "Atorvastatin 10mg",    category: "Lipid-lowering",   price: 65.00,  stock: 90,  gstRate: 5  },
  { name: "Amlodipine 5mg",       category: "Antihypertensive", price: 48.00,  stock: 5,   gstRate: 5  },
  { name: "Dolo 650mg",           category: "Analgesic",        price: 30.00,  stock: 250, gstRate: 5  },
];

async function main() {
  console.log('🌱 Seeding database...');
  for (const med of medicines) {
    await prisma.medicine.upsert({
      where: { id: medicines.indexOf(med) + 1 },
      update: {},
      create: med,
    });
  }
  console.log('✅ Seeded', medicines.length, 'medicines');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
