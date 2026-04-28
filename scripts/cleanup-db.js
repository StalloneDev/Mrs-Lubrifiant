const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../src/generated/client');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('--- Début du nettoyage de la base de données ---');

    const tables = [
        'stockMovement', 'stockLevel', 'saleLine', 'sale',
        'deliveryLine', 'delivery', 'visit', 'payment',
        'paymentAllocation', 'invoice', 'commission',
        'discrepancyLog', 'auditLog', 'warehouse', 'partner',
        'product'
    ];

    for (const table of tables) {
        try {
            const res = await prisma[table].deleteMany({});
            console.log(`[CLEANUP] Table ${table.padEnd(15)} : ${res.count} lignes supprimées.`);
        } catch (err) {
            console.error(`[ERROR] Erreur lors du nettoyage de ${table} :`, err.message);
        }
    }

    console.log('--- Nettoyage terminé. La table User a été préservée. ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
