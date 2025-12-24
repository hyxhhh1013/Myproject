const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // 测试连接
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // 测试查询
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in the database`);
    
    // 关闭连接
    await prisma.$disconnect();
    console.log('✅ Database connection closed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('📋 Error details:', error);
    
    // 关闭连接
    await prisma.$disconnect();
    return false;
  }
}

// 运行测试
testConnection();