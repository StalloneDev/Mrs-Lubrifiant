const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../src/generated/client');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const tables = [
        'user', 'product', 'partner', 'warehouse',
        'delivery', 'deliveryLine', 'stockMovement', 'stockLevel',
        'sale', 'saleLine', 'invoice', 'payment', 'commission',
        'visit', 'discrepancyLog', 'auditLog'
    ];

    console.log('--- FINAL STATE VERIFICATION ---');
    for (const table of tables) {
        try {
            const count = await prisma[table].count();
            console.log(`${table.padEnd(20)}: ${count} rows`);
        } catch (e) {
            console.error(`Error counting ${table}: ${e.message}`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
