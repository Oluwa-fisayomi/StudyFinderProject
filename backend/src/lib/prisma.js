import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client.ts'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured. Check your backend .env file.')
}

const adapter = new PrismaPg({
  connectionString
})

const prisma = new PrismaClient({
  adapter
})

export default prisma