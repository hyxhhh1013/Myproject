import sharp from 'sharp';
import exifr from 'exifr';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'node:crypto';

const UPLOADS_DIR = process.env.UPLOAD_DIR
  ? path.join(process.env.UPLOAD_DIR, 'images')
  : path.join(__dirname, '../../uploads/images');

async function ensureUploadsDir() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

function generateFilename(ext: string = 'webp'): string {
  return `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
}

export interface ExifData {
  cameraModel?: string;
  make?: string;
  LensModel?: string;
  focalLength?: number;
  aperture?: number;
  shutterSpeed?: number;
  iso?: number;
  takenAt?: Date;
}

async function saveBuffer(buffer: Buffer, filename: string): Promise<string> {
  await ensureUploadsDir();
  const filePath = path.join(UPLOADS_DIR, filename);
  await fs.writeFile(filePath, buffer);
  return `/uploads/images/${filename}`;
}

export const generateThumbnail = async (buffer: Buffer): Promise<string> => {
  const thumbnailBuffer = await sharp(buffer)
    .resize(300, 300, { fit: 'cover' })
    .webp({ quality: 60 })
    .toBuffer();
  const filename = `thumb_${generateFilename()}`;
  return saveBuffer(thumbnailBuffer, filename);
};

export const optimizeImage = async (buffer: Buffer, maxWidth = 1600): Promise<string> => {
  const optimizedBuffer = await sharp(buffer)
    .resize(maxWidth, null, { withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: 80 })
    .toBuffer();
  const filename = generateFilename();
  return saveBuffer(optimizedBuffer, filename);
};

/**
 * 迁移存量 base64 数据到文件系统
 * 输入: data:image/webp;base64,xxx  →  保存文件  →  返回 /uploads/images/{uuid}.webp
 */
export const migrateBase64ToFile = async (base64Str: string): Promise<string | null> => {
  if (!base64Str || !base64Str.startsWith('data:image')) return null;

  try {
    const matches = base64Str.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return null;

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const data = Buffer.from(matches[2], 'base64');
    const filename = generateFilename(ext);

    await ensureUploadsDir();
    const filePath = path.join(UPLOADS_DIR, filename);
    await fs.writeFile(filePath, data);
    return `/uploads/images/${filename}`;
  } catch (err) {
    console.error('Failed to migrate base64 image:', err);
    return null;
  }
};

export const readExifData = async (buffer: Buffer): Promise<ExifData> => {
  try {
    const exif = await exifr.parse(buffer, {
      gps: false,
      mergeOutput: true,
    }) as any;

    if (!exif) return {};

    const cameraModel = exif.Model || exif.CameraModelName;
    const make = exif.Make;
    const LensModel = exif.LensModel || exif.Lens;
    const focalLength = exif.FocalLength || exif.FocalLengthIn35mmFormat;
    const aperture = exif.FNumber || exif.ApertureValue;
    const shutterSpeed = exif.ExposureTime || exif.ShutterSpeedValue;
    const iso = exif.ISO;
    const takenAt = exif.DateTimeOriginal || exif.CreateDate || exif.ModifyDate;

    let formattedShutterSpeed = shutterSpeed;
    if (typeof shutterSpeed === 'number' && shutterSpeed > 0 && shutterSpeed < 1) {
      formattedShutterSpeed = `1/${Math.round(1 / shutterSpeed)}`;
    }

    return {
      cameraModel,
      make,
      LensModel,
      focalLength,
      aperture,
      shutterSpeed: formattedShutterSpeed,
      iso,
      takenAt,
    };
  } catch (error) {
    return {};
  }
};
