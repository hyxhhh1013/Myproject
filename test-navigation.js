const puppeteer = require('puppeteer');

async function testNavigation() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  
  try {
    // 导航到首页
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle2' });
    console.log('成功导航到首页');
    
    // 等待底部导航栏加载
    await page.waitForSelector('.fixed.bottom-6', { timeout: 5000 });
    console.log('底部导航栏已加载');
    
    // 获取所有导航链接
    const navLinks = await page.$$('.fixed.bottom-6 a');
    console.log(`找到 ${navLinks.length} 个导航链接`);
    
    // 遍历链接并输出名称和href
    for (let i = 0; i < navLinks.length; i++) {
      const link = navLinks[i];
      const text = await link.evaluate(el => {
        const icon = el.querySelector('span.text-2xl')?.textContent || '';
        const label = el.querySelector('span.text-xs')?.textContent || '';
        return `${icon} ${label}`;
      });
      const href = await link.evaluate(el => el.getAttribute('href'));
      console.log(`${i}: ${text.trim()} -> ${href}`);
    }
    
    // 测试兴趣页面跳转
    console.log('\n测试兴趣页面跳转...');
    await page.click('a[href="/interests"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log(`成功跳转到兴趣页面，当前URL: ${page.url()}`);
    
    // 测试联系页面跳转
    console.log('\n测试联系页面跳转...');
    await page.click('a[href="/contact"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log(`成功跳转到联系页面，当前URL: ${page.url()}`);
    
    // 返回首页
    console.log('\n返回首页...');
    await page.click('a[href="/"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log(`成功返回首页，当前URL: ${page.url()}`);
    
    console.log('\n所有导航测试通过！');
    
  } catch (error) {
    console.error('导航测试失败:', error);
  } finally {
    await browser.close();
  }
}

testNavigation();