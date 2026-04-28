const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('Pass123!', 10);

    const commercial = await prisma.user.upsert({
        where: { email: 'commercial@mrs.bj' },
        update: {},
        create: {
            email: 'commercial@mrs.bj',
            full_name: 'Commercial de Test',
            password_hash: password,
            role: 'COMMERCIAL',
            assigned_zone: 'Cotonou',
            phone: '+22911111111',
        },
    });

    const livreur = await prisma.user.upsert({
        where: { email: 'livreur@mrs.bj' },
        update: {},
        create: {
            email: 'livreur@mrs.bj',
            full_name: 'Livreur de Test',
            password_hash: password,
            role: 'DELIVERY',
            phone: '+22922222222',
        },
    });

    console.log('Utilisateurs de test créés');
}

main().catch(console.error).finally(() => prisma.$disconnect());
