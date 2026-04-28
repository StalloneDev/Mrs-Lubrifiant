const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../src/generated/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'admin@mrs.bj';
  const hashedPassword = await bcrypt.hash('MRS_Admin2024!', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      full_name: 'Administrateur MRS',
      password_hash: hashedPassword,
      role: 'ADMIN',
      phone: '+22900000000',
    },
  });

  console.log('Utilisateur admin créé:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


// Administrateur : admin@mrs.bj / MRS_Admin2024! (Vue globale)
// Commercial : commercial@mrs.bj / Pass123! (Isolation zone Cotonou)
