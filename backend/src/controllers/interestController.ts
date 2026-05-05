import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { encode } from 'blurhash';

const prisma = new PrismaClient();

// 配置图片上传存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + path.parse(file.originalname).name + '.webp');
  }
});

const upload = multer({ storage: storage });

// 生成 BlurHash
const generateBlurHash = async (imagePath: string): Promise<string> => {
  try {
    // 使用 sharp 读取图片
    const image = await sharp(imagePath);
    const metadata = await image.metadata();
    
    // 调整图片大小以提高性能
    const resizedImage = await image
      .resize(32, 32, { fit: 'cover' })
      .raw()
      .toBuffer();
    
    // 获取调整后的宽高
    const width = 32;
    const height = 32;
    
    // 将 Buffer 转换为 Uint8ClampedArray
    const pixels = new Uint8ClampedArray(resizedImage);
    
    // 生成 blurhash
    return encode(pixels, width, height, 4, 4);
  } catch (error) {
    console.error('Error generating blurhash:', error);
    return '';
  }
};

// 优化图片为 WebP 格式
const optimizeImage = async (filePath: string): Promise<void> => {
  try {
    await sharp(filePath)
      .webp({ quality: 80 })
      .toFile(filePath);
  } catch (error) {
    console.error('Error optimizing image:', error);
  }
};

// 获取所有兴趣
const getAllInterests = async (req: Request, res: Response) => {
  try {
    const interests = await prisma.interest.findMany();
    res.json(interests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interests' });
  }
};

// 获取单个兴趣
const getInterestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const interest = await prisma.interest.findUnique({
      where: { id: parseInt(id) }
    });
    if (!interest) {
      res.status(404).json({ error: 'Interest not found' });
      return;
    }
    res.json(interest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interest' });
  }
};

// 创建兴趣
const createInterest = async (req: Request, res: Response) => {
  try {
    const { title, type, description, tags, rating, status } = req.body;
    let coverUrl = '';
    let blurHash = '';

    if (req.file) {
      // 优化图片为 WebP 格式
      await optimizeImage(req.file.path);
      
      // 生成 BlurHash
      blurHash = await generateBlurHash(req.file.path);
      
      coverUrl = '/uploads/' + req.file.filename;
    }

    const interest = await prisma.interest.create({
      data: {
        title,
        type,
        coverUrl,
        blurHash,
        description,
        tags,
        rating: rating ? parseFloat(rating) : null,
        status
      }
    });

    res.status(201).json(interest);
  } catch (error) {
    console.error('Error creating interest:', error);
    res.status(500).json({ error: 'Failed to create interest' });
  }
};

// 更新兴趣
const updateInterest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, type, description, tags, rating, status } = req.body;
    let coverUrl = undefined;
    let blurHash = undefined;

    if (req.file) {
      // 优化图片为 WebP 格式
      await optimizeImage(req.file.path);
      
      // 生成 BlurHash
      blurHash = await generateBlurHash(req.file.path);
      
      coverUrl = '/uploads/' + req.file.filename;
    }

    const interest = await prisma.interest.update({
      where: { id: parseInt(id) },
      data: {
        title,
        type,
        ...(coverUrl && { coverUrl }),
        ...(blurHash && { blurHash }),
        description,
        tags,
        rating: rating ? parseFloat(rating) : null,
        status
      }
    });

    res.json(interest);
  } catch (error) {
    console.error('Error updating interest:', error);
    res.status(500).json({ error: 'Failed to update interest' });
  }
};

// 删除兴趣
const deleteInterest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.interest.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Interest deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete interest' });
  }
};

export const interestController = {
  getAllInterests,
  getInterestById,
  createInterest,
  updateInterest,
  deleteInterest,
  upload
};
