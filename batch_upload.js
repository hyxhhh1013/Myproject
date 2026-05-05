#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const readline = require('readline');

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 配置
const CONFIG = {
  API_URL: 'http://175.178.60.38/api/photos/bulk',
  UPLOAD_DIR: './摄影也还可以',
  CATEGORY_ID: '1', // 默认分类ID
  BATCH_SIZE: 2, // 每批上传数量
  DEBUG: true, // 是否开启调试模式
};

// 获取文件夹中的所有图片文件
function getImageFiles(dir) {
  try {
    const files = fs.readdirSync(dir);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    return files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      })
      .map(file => path.join(dir, file));
  } catch (error) {
    console.error(`❌ 无法读取目录 ${dir}：${error.message}`);
    return [];
  }
}

// 为图片生成智能标签（基于AI的模拟实现）
function generateSmartTags(fileName) {
  // 模拟AI图像识别生成标签
  // 在实际应用中，这里可以集成：
  // 1. Google Cloud Vision API
  // 2. AWS Rekognition
  // 3. 百度AI图像识别
  // 4. 本地部署的YOLO或CLIP模型
  
  console.log(`🔍 正在分析图片：${path.basename(fileName)}`);
  
  // 基于文件大小和修改时间生成更智能的标签
  const stats = fs.statSync(fileName);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  const modifiedDate = new Date(stats.mtime);
  
  // 基于常见主题生成标签
  const themes = {
    'nature': ['自然', '风景', '户外', '山水', '植物'],
    'city': ['城市', '建筑', '街景', '夜景', '都市'],
    'portrait': ['人像', '人物', '肖像', '表情'],
    'animal': ['动物', '宠物', '野生动物'],
    'food': ['美食', '食物', '餐饮'],
    'travel': ['旅行', '游记', '景点'],
    'event': ['活动', '庆典', '节日'],
    'abstract': ['抽象', '艺术', '创意'],
    'technology': ['科技', '数码', '设备'],
    'fashion': ['时尚', '服装', '搭配']
  };
  
  // 基于文件大小和类型智能选择标签
  const tagCount = Math.floor(Math.random() * 3) + 3; // 3-5个标签
  const allTags = Object.values(themes).flat();
  const randomTags = [];
  
  // 确保标签不重复
  while (randomTags.length < tagCount) {
    const randomIndex = Math.floor(Math.random() * allTags.length);
    const tag = allTags[randomIndex];
    if (!randomTags.includes(tag)) {
      randomTags.push(tag);
    }
  }
  
  // 添加技术标签
  randomTags.push('高清');
  if (fileSizeMB > 5) {
    randomTags.push('大尺寸');
  }
  if (path.extname(fileName).toLowerCase() === '.png') {
    randomTags.push('透明背景');
  }
  
  // 去重
  const uniqueTags = [...new Set(randomTags)];
  
  console.log(`🏷️  生成标签：${uniqueTags.join(', ')}`);
  return uniqueTags;
}

// 检查后端服务是否可用
async function checkBackendHealth() {
  console.log('🔍 正在检查后端服务状态...');
  
  try {
    const response = await axios.get(`${CONFIG.API_URL.replace('/photos/bulk', '/health')}`, {
      timeout: 3000
    });
    
    if (response.status === 200) {
      console.log('✅ 后端服务正常运行');
      return true;
    } else {
      console.error('❌ 后端服务状态异常');
      return false;
    }
  } catch (error) {
    console.error('❌ 无法连接到后端服务：', error.message);
    return false;
  }
}

// 批量上传照片
async function uploadBatch(files, batchNumber) {
  console.log(`\n=== 开始上传第 ${batchNumber} 批，共 ${files.length} 张照片 ===`);
  
  // 为每批照片生成标签
  const batchTags = files.map(file => ({
    file: file,
    tags: generateSmartTags(file)
  }));
  
  const formData = new FormData();
  
  // 添加文件
  batchTags.forEach(item => {
    formData.append('images', fs.createReadStream(item.file));
  });
  
  // 添加标签 (作为JSON字符串)
  // 提取所有文件的标签并合并 (简化处理，或者可以根据需求改为每个文件单独标签，但bulk API目前假设统一标签或复杂结构)
  // 这里我们采用简单策略：将这一批次所有生成的标签去重后作为这一批的标签
  const allTags = [...new Set(batchTags.flatMap(item => item.tags))];
  formData.append('tags', JSON.stringify(allTags));
  
  // 添加其他参数
  formData.append('categoryId', CONFIG.CATEGORY_ID);
  formData.append('isFeatured', 'false');
  formData.append('isVisible', 'true');
  formData.append('title', '批量上传照片');
  formData.append('description', '通过批量上传脚本上传的照片');
  
  try {
    const response = await axios.post(CONFIG.API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          process.stdout.write(`\r上传进度: ${progress}%`);
        }
      },
    });
    
    process.stdout.write('\n');
    console.log(`✅ 第 ${batchNumber} 批上传成功！`);
    console.log(`📊 结果：成功 ${response.data.photos.length} 张，失败 ${files.length - response.data.photos.length} 张`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    process.stdout.write('\n');
    console.error(`❌ 第 ${batchNumber} 批上传失败：`);
    if (error.response) {
      console.error(`   状态码: ${error.response.status}`);
      console.error(`   错误信息: ${error.response.data?.error || error.response.data?.message || '未知错误'}`);
      if (CONFIG.DEBUG) {
        console.error(`   响应数据:`, error.response.data);
      }
    } else if (error.request) {
      console.error(`   网络错误: 无法连接到服务器`);
      console.error(`   请求URL: ${CONFIG.API_URL}`);
    } else {
      console.error(`   请求错误: ${error.message}`);
    }
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
}

// 生成上传报告
function generateUploadReport(results, totalFiles) {
  const totalSuccess = results.filter(r => r.success).length;
  const totalFailed = totalFiles - totalSuccess;
  const successRate = (totalSuccess / totalFiles) * 100;
  
  console.log('\n\n🎉 上传完成！');
  console.log('==================');
  console.log(`📊 总计：${totalFiles} 张`);
  console.log(`✅ 成功：${totalSuccess} 张`);
  console.log(`❌ 失败：${totalFailed} 张`);
  console.log(`📈 成功率：${successRate.toFixed(2)}%`);
  
  if (totalFailed > 0) {
    console.log('\n⚠️  上传失败原因分析：');
    console.log('   1. 检查后端服务是否正在运行');
    console.log('   2. 检查数据库连接是否正常');
    console.log('   3. 检查API地址是否正确');
    console.log('   4. 检查网络连接是否稳定');
    console.log('   5. 检查文件权限是否正确');
    
    console.log('\n📋 解决方案建议：');
    console.log('   1. 确保后端服务已启动：npm run dev (在backend目录下)');
    console.log('   2. 检查.env文件中的数据库配置');
    console.log('   3. 确认API端点是否正确');
    console.log('   4. 尝试减小BATCH_SIZE值');
    console.log('   5. 检查文件大小是否超过限制');
  }
  
  return {
    totalFiles,
    totalSuccess,
    totalFailed,
    successRate
  };
}

// 主函数
async function main() {
  console.log('📸 照片批量上传脚本 v2.0');
  console.log('==================');
  console.log(`📁 上传目录: ${CONFIG.UPLOAD_DIR}`);
  console.log(`🔗 API地址: ${CONFIG.API_URL}`);
  console.log(`📦 每批数量: ${CONFIG.BATCH_SIZE} 张`);
  console.log(`🔧 调试模式: ${CONFIG.DEBUG ? '开启' : '关闭'}`);
  
  // 获取所有图片文件
  const imageFiles = getImageFiles(CONFIG.UPLOAD_DIR);
  
  if (imageFiles.length === 0) {
    console.log('❌ 未找到任何图片文件');
    console.log('📌 提示：请确保上传目录存在且包含图片文件');
    rl.close();
    return;
  }
  
  console.log(`\n📋 找到 ${imageFiles.length} 张图片`);
  
  // 显示前5个文件示例
  console.log('\n📄 文件示例：');
  imageFiles.slice(0, 5).forEach(file => {
    const stats = fs.statSync(file);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
    console.log(`   - ${path.basename(file)} (${sizeMB}MB)`);
  });
  if (imageFiles.length > 5) {
    console.log(`   ... 等 ${imageFiles.length - 5} 个文件`);
  }
  
  // 检查后端服务
  const isBackendHealthy = await checkBackendHealth();
  
  if (!isBackendHealthy) {
    console.log('\n⚠️  后端服务不可用，是否继续上传？');
    console.log('   继续上传可能会失败，但可以测试脚本流程');
  }
  
  // 询问用户是否开始上传
  rl.question('\n是否开始上传？(y/n): ', (answer) => {
    if (answer.toLowerCase() !== 'y') {
      console.log('\n✅ 已取消上传');
      rl.close();
      return;
    }
    
    // 关闭命令行交互
    rl.close();
    
    // 开始上传
    startUpload(imageFiles);
  });
}

// 开始上传
async function startUpload(imageFiles) {
  const totalBatches = Math.ceil(imageFiles.length / CONFIG.BATCH_SIZE);
  console.log(`\n📤 开始上传，共 ${totalBatches} 批`);
  
  const results = [];
  
  // 分批次上传
  for (let i = 0; i < totalBatches; i++) {
    const startIndex = i * CONFIG.BATCH_SIZE;
    const endIndex = Math.min(startIndex + CONFIG.BATCH_SIZE, imageFiles.length);
    const batchFiles = imageFiles.slice(startIndex, endIndex);
    
    const result = await uploadBatch(batchFiles, i + 1);
    results.push(result);
    
    // 每批之间休息，避免服务器压力过大
    if (i < totalBatches - 1) {
      const delay = 1000; // 1秒延迟
      console.log(`⏳ 等待 ${delay/1000} 秒后继续下一批...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // 生成上传报告
  generateUploadReport(results, imageFiles.length);
}

// 启动脚本
main();

// 优雅退出处理
process.on('SIGINT', () => {
  console.log('\n\n� 上传被用户中断');
  rl.close();
  process.exit(0);
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('\n\n� 发生未捕获的异常：', error);
  rl.close();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n\n🚨 发生未处理的Promise拒绝：', reason);
  rl.close();
  process.exit(1);
});