import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('Testing connection to:', process.env.DATABASE_URL);
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Connection successful:', result);
  } catch (error: any) {
    console.error('Connection failed:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main();
