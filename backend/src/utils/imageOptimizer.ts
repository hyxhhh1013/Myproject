import sharp from 'sharp';
import path from 'path';

/**
 * 优化图片：限制最大尺寸并转换为 WebP 格式以节省空间和提高加载速度
 * @param input 原始图片路径或 Buffer
 * @param maxWidth 最大宽度，默认 1920px (从 2560px 调低以加速)
 * @param quality 质量，默认 75 (从 85 调低以减小体积)
 * @returns 优化后的图片 Buffer
 */
export const optimizeImageBuffer = async (
  input: string | Buffer, 
  maxWidth: number = 1920, 
  quality: number = 75
): Promise<{ buffer: Buffer, info: sharp.OutputInfo }> => {
  let pipeline = sharp(input);
  const metadata = await pipeline.metadata();
  
  // 如果宽度超过限制，进行等比缩放
  if (metadata.width && metadata.width > maxWidth) {
    pipeline = pipeline.resize(maxWidth, null, {
      withoutEnlargement: true,
      fastShrinkOnLoad: true
    });
  }
  
  // 统一转为 WebP 格式并返回 Buffer
  const { data, info } = await pipeline
    .toFormat('webp', { quality, effort: 2 }) // effort: 2 提高压缩速度
    .toBuffer({ resolveWithObject: true });
    
  return { buffer: data, info };
};

/**
 * 生成缩略图 Buffer
 */
export const generateThumbnailBuffer = async (
  input: string | Buffer, 
  size: number = 300, 
  quality: number = 70
): Promise<{ buffer: Buffer, info: sharp.OutputInfo }> => {
  const { data, info } = await sharp(input)
    .resize(size, size, { fit: 'cover' })
    .toFormat('webp', { quality, effort: 2 })
    .toBuffer({ resolveWithObject: true });
    
  return { buffer: data, info };
};

// 保留路径版本的 API 兼容旧代码，但内部使用 Buffer 处理
export const optimizeImage = async (imagePath: string, maxWidth: number = 1920, quality: number = 75): Promise<string> => {
  const ext = path.extname(imagePath);
  const optimizedPath = imagePath.replace(ext, `-opt${Date.now()}.webp`);
  const { buffer } = await optimizeImageBuffer(imagePath, maxWidth, quality);
  const fs = require('fs/promises');
  await fs.writeFile(optimizedPath, buffer);
  return optimizedPath;
};

export const generateThumbnail = async (imagePath: string, size: number = 300, quality: number = 70): Promise<string> => {
  const ext = path.extname(imagePath);
  const thumbnailPath = imagePath.replace(ext, `-th${Date.now()}.webp`);
  const { buffer } = await generateThumbnailBuffer(imagePath, size, quality);
  const fs = require('fs/promises');
  await fs.writeFile(thumbnailPath, buffer);
  return thumbnailPath;
};
