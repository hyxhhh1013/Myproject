const dns = require('dns').promises;
const net = require('net');
const axios = require('axios');

// Supabase数据库配置
const SUPABASE_CONFIG = {
  host: 'db.oxvrtyriwzchaxehbbsd.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
};

async function testDNSResolution() {
  console.log('🔍 Testing DNS resolution for', SUPABASE_CONFIG.host);
  try {
    const addresses = await dns.resolve4(SUPABASE_CONFIG.host);
    console.log('✅ DNS resolution successful!');
    console.log('   IP Addresses:', addresses.join(', '));
    return addresses;
  } catch (error) {
    console.error('❌ DNS resolution failed:', error.message);
    return [];
  }
}

function testTCPConnection(host, port, timeout = 5000) {
  console.log(`🔌 Testing TCP connection to ${host}:${port}`);
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port, timeout });
    
    socket.on('connect', () => {
      console.log(`✅ TCP connection to ${host}:${port} successful!`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', (error) => {
      console.error(`❌ TCP connection to ${host}:${port} failed:`, error.message);
      resolve(false);
    });
    
    socket.on('timeout', () => {
      console.error(`⏱️ TCP connection to ${host}:${port} timed out after ${timeout}ms`);
      socket.destroy();
      resolve(false);
    });
  });
}

async function testSupabaseHealthCheck() {
  console.log('🩺 Testing Supabase health check');
  try {
    // Supabase提供的健康检查端点（示例，实际可能不同）
    const response = await axios.get('https://status.supabase.com', { timeout: 5000 });
    console.log('✅ Supabase status page accessible!');
    console.log('   Status code:', response.status);
    return true;
  } catch (error) {
    console.error('❌ Supabase health check failed:', error.message);
    return false;
  }
}

async function testPrismaConnection() {
  console.log('📦 Testing Prisma connection with detailed logging');
  try {
    const { PrismaClient } = require('@prisma/client');
    
    // 配置更详细的日志和更长的超时时间
    const prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
    
    console.log('   Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Prisma connection successful!');
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('❌ Prisma connection failed:', error.message);
    console.error('   Error type:', error.code || 'Unknown');
    console.error('   Error details:', error);
    return false;
  }
}

async function runDiagnostics() {
  console.log('🚀 Starting network diagnostics for Supabase connection');
  console.log('='.repeat(60));
  
  const results = {
    dns: false,
    tcp: false,
    health: false,
    prisma: false,
  };
  
  // 1. 测试DNS解析
  const ipAddresses = await testDNSResolution();
  results.dns = ipAddresses.length > 0;
  console.log();
  
  // 2. 测试TCP连接
  if (results.dns) {
    for (const ip of ipAddresses) {
      const success = await testTCPConnection(ip, SUPABASE_CONFIG.port);
      if (success) {
        results.tcp = true;
        break;
      }
    }
  } else {
    // 尝试直接连接主机名
    results.tcp = await testTCPConnection(SUPABASE_CONFIG.host, SUPABASE_CONFIG.port);
  }
  console.log();
  
  // 3. 测试Supabase健康检查
  results.health = await testSupabaseHealthCheck();
  console.log();
  
  // 4. 测试Prisma连接
  results.prisma = await testPrismaConnection();
  console.log();
  
  // 显示总结
  console.log('📋 Diagnostic Summary');
  console.log('='.repeat(60));
  console.log(`DNS Resolution: ${results.dns ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`TCP Connection: ${results.tcp ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Supabase Health: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Prisma Connection: ${results.prisma ? '✅ PASS' : '❌ FAIL'}`);
  console.log();
  
  // 提供解决方案
  console.log('💡 Recommended Solutions');
  console.log('='.repeat(60));
  
  if (!results.dns) {
    console.log('🔧 DNS Resolution Issues:');
    console.log('   1. Check if the DNS server is configured correctly');
    console.log('   2. Verify the hostname is correct: db.oxvrtyriwzchaxehbbsd.supabase.co');
    console.log('   3. Try using a different DNS server (e.g., 8.8.8.8)');
    console.log('   4. Check network configuration and proxy settings');
  }
  
  if (!results.tcp) {
    console.log('🔧 TCP Connection Issues:');
    console.log('   1. Check if port 5432 is not blocked by firewall');
    console.log('   2. Verify your IP address is allowed in Supabase dashboard');
    console.log('   3. Try increasing connection timeout');
    console.log('   4. Check if Supabase database is active');
  }
  
  if (!results.prisma) {
    console.log('🔧 Prisma Connection Issues:');
    console.log('   1. Verify DATABASE_URL is correct in .env file');
    console.log('   2. Check if SSL is properly configured');
    console.log('   3. Update Prisma Client: npm install @prisma/client');
    console.log('   4. Regenerate Prisma Client: npx prisma generate');
    console.log('   5. Try adding sslmode=require to DATABASE_URL');
    console.log('   6. Check if database name and username are correct');
  }
  
  // 通用建议
  console.log('\n🔍 General Troubleshooting Steps:');
  console.log('   1. Login to Supabase dashboard to verify database status');
  console.log('   2. Check Supabase status page for ongoing issues');
  console.log('   3. Verify all credentials in connection string');
  console.log('   4. Try restarting your database in Supabase dashboard');
  console.log('   5. Check if your account has active subscription');
  console.log('   6. Try using a different network connection');
  console.log('   7. Test with a simple psql command if available');
  
  console.log('\n📞 Supabase Support:');
  console.log('   If issues persist, contact Supabase support with this diagnostic report');
}

// 运行诊断
runDiagnostics();