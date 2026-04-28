const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

console.log('DATABASE_URL length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0)

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  try {
    const users = await prisma.user.findMany({ take: 1 })
    console.log('Success! Users found:', users.length)
  } catch (e) {
    console.error('Prisma Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
