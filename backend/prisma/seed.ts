import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@acente.app";
  const password = await bcrypt.hash("demo1234", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password,
      fullName: "Demo Kullanıcı",
      companyName: "Demo İşletme",
    },
  });

  const cash = await prisma.cashAccount.upsert({
    where: { id: "seed-cash" },
    update: {},
    create: { id: "seed-cash", userId: user.id, name: "Kasa", type: "CASH", currency: "TRY", balance: 5000 },
  });

  const bank = await prisma.cashAccount.upsert({
    where: { id: "seed-bank" },
    update: {},
    create: { id: "seed-bank", userId: user.id, name: "İş Bankası", type: "BANK", currency: "TRY", balance: 25000 },
  });

  const salesCategory = await prisma.category.upsert({
    where: { id: "seed-cat-sales" },
    update: {},
    create: { id: "seed-cat-sales", userId: user.id, name: "Satış Geliri", type: "INCOME", color: "#16A34A", icon: "trending-up" },
  });

  const rentCategory = await prisma.category.upsert({
    where: { id: "seed-cat-rent" },
    update: {},
    create: { id: "seed-cat-rent", userId: user.id, name: "Kira", type: "EXPENSE", color: "#DC2626", icon: "home" },
  });

  const customer = await prisma.account.upsert({
    where: { id: "seed-customer" },
    update: {},
    create: { id: "seed-customer", userId: user.id, name: "ABC Ticaret Ltd. Şti.", type: "CUSTOMER", email: "info@abc.com" },
  });

  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        type: "INCOME",
        amount: 12000,
        description: "Danışmanlık hizmeti",
        cashAccountId: bank.id,
        categoryId: salesCategory.id,
        accountId: customer.id,
      },
      {
        userId: user.id,
        type: "EXPENSE",
        amount: 4500,
        description: "Ofis kirası",
        cashAccountId: bank.id,
        categoryId: rentCategory.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed tamamlandı. Giriş bilgileri: demo@acente.app / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
