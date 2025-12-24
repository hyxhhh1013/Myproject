"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchUpdateCategory = exports.batchDeletePhotos = exports.updatePhotosOrder = exports.getPhoto = exports.deletePhoto = exports.updatePhoto = exports.bulkUploadPhotos = exports.createPhoto = exports.getAllPhotos = exports.upload = void 0;
const index_1 = require("../index");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const exifr_1 = __importDefault(require("exifr"));
const fs_1 = __importDefault(require("fs"));
const errorHandler_1 = require("../middleware/errorHandler");
// 配置文件存储
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    },
});
// 文件过滤
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('只允许上传图片文件'));
    }
};
// 配置multer
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 40 * 1024 * 1024, // 40MB
    },
});
exports.upload = upload;
// 模拟CDN地址
const CDN_BASE_URL = process.env.CDN_BASE_URL || '';
// 生成缩略图
const generateThumbnail = async (imagePath) => {
    const thumbnailPath = imagePath.replace(/(\.[^.]+)$/, '-thumbnail$1');
    await (0, sharp_1.default)(imagePath)
        .resize(300, 300, { fit: 'cover' })
        .toFile(thumbnailPath);
    return thumbnailPath;
};
// 读取EXIF信息
const readExifData = async (imagePath) => {
    try {
        const exif = await exifr_1.default.parse(imagePath, {
            gps: false,
            mergeOutput: true,
        });
        return {
            cameraModel: exif.Model,
            make: exif.Make,
            focalLength: exif.FocalLength,
            aperture: exif.FNumber,
            shutterSpeed: exif.ExposureTime,
            iso: exif.ISO,
            takenAt: exif.DateTimeOriginal || exif.CreateDate,
        };
    }
    catch (error) {
        console.error('读取EXIF信息失败:', error);
        return {};
    }
};
// 获取所有作品
const getAllPhotos = async (req, res) => {
    try {
        const { categoryId, isFeatured, page = 1, limit = 20, search, sort } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {
            isVisible: true,
        };
        if (categoryId) {
            where.categoryId = parseInt(categoryId);
        }
        if (isFeatured === 'true') {
            where.isFeatured = true;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                // 简单的标签搜索
                { tags: { some: { name: { contains: search, mode: 'insensitive' } } } }
            ];
        }
        let orderBy = [{ isFeatured: 'desc' }, { orderIndex: 'asc' }, { takenAt: 'desc' }];
        if (sort === 'date_asc') {
            orderBy = { takenAt: 'asc' };
        }
        else if (sort === 'date_desc') {
            orderBy = { takenAt: 'desc' };
        }
        else if (sort === 'size_desc') {
            orderBy = { size: 'desc' };
        }
        const [photos, total] = await Promise.all([
            index_1.prisma.photo.findMany({
                where,
                include: {
                    category: {
                        select: { id: true, name: true, slug: true },
                    },
                    tags: true,
                },
                orderBy,
                skip,
                take: parseInt(limit),
            }),
            index_1.prisma.photo.count({ where }),
        ]);
        res.json({
            photos,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        });
    }
    catch (error) {
        res.status(500).json({ error: '获取作品失败' });
    }
};
exports.getAllPhotos = getAllPhotos;
// 创建作品 - 支持文件上传
const createPhoto = async (req, res) => {
    try {
        // 注意：这个函数需要配合multer中间件使用
        // 实际的文件对象会在req.file中
        const file = req.file;
        if (!file) {
            throw new errorHandler_1.AppError('请上传图片文件', 400);
        }
        const { title, description, categoryId, isFeatured = false, isVisible = true, orderIndex = 0, tags // json string array
         } = req.body;
        // 验证categoryId是否存在
        if (!categoryId) {
            throw new errorHandler_1.AppError('请提供分类ID', 400);
        }
        const category = await index_1.prisma.photoCategory.findUnique({
            where: { id: parseInt(categoryId) },
        });
        if (!category) {
            throw new errorHandler_1.AppError(`分类ID ${categoryId} 不存在`, 404);
        }
        // 生成缩略图
        const thumbnailPath = await generateThumbnail(file.path);
        // 读取EXIF信息
        const exifData = await readExifData(file.path);
        // 获取图片尺寸和大小
        const metadata = await (0, sharp_1.default)(file.path).metadata();
        // 构建CDN URL
        const imageUrl = `${CDN_BASE_URL}/uploads/${path_1.default.basename(file.path)}`;
        const thumbnailUrl = `${CDN_BASE_URL}/uploads/${path_1.default.basename(thumbnailPath)}`;
        // 使用EXIF中的拍摄日期，如果没有则使用当前时间
        const takenAt = exifData.takenAt ? new Date(exifData.takenAt) : new Date();
        // 处理标签
        let tagConnect = [];
        if (tags) {
            const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            if (Array.isArray(parsedTags)) {
                for (const tagName of parsedTags) {
                    tagConnect.push({
                        where: { name: tagName },
                        create: { name: tagName }
                    });
                }
            }
        }
        const photo = await index_1.prisma.photo.create({
            data: {
                title: title || `照片_${Date.now()}`,
                description,
                imageUrl,
                thumbnailUrl,
                categoryId: parseInt(categoryId),
                isFeatured: isFeatured === 'true' || isFeatured === true,
                isVisible: isVisible === 'true' || isVisible === true,
                orderIndex: parseInt(orderIndex),
                takenAt,
                exifData,
                width: metadata.width,
                height: metadata.height,
                size: metadata.size,
                tags: {
                    connectOrCreate: tagConnect
                }
            },
            include: {
                tags: true
            }
        });
        res.json(photo);
    }
    catch (error) {
        console.error('创建作品失败:', {
            timestamp: new Date().toISOString(),
            error,
            request: {
                path: req.path,
                method: req.method,
                body: req.body,
            },
        });
        if (error instanceof errorHandler_1.AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        res.status(500).json({ error: '创建作品失败' });
    }
};
exports.createPhoto = createPhoto;
// 批量上传作品
const bulkUploadPhotos = async (req, res) => {
    try {
        // 注意：这个函数需要配合multer.array中间件使用
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: '请上传至少一张图片' });
        }
        const { title, description, categoryId, isFeatured = false, isVisible = true, tags } = req.body;
        if (!categoryId) {
            return res.status(400).json({ error: '请选择分类' });
        }
        // 一次获取当前最大的orderIndex，避免多次查询
        const maxOrderIndexResult = await index_1.prisma.photo.aggregate({
            _max: { orderIndex: true },
        });
        let currentOrderIndex = (maxOrderIndexResult._max.orderIndex || 0);
        const uploadResults = await Promise.all(files.map(async (file, index) => {
            try {
                // 生成缩略图
                const thumbnailPath = await generateThumbnail(file.path);
                // 读取EXIF信息
                const exifData = await readExifData(file.path);
                // 获取图片尺寸和大小
                const metadata = await (0, sharp_1.default)(file.path).metadata();
                // 构建CDN URL
                const imageUrl = `${CDN_BASE_URL}/uploads/${path_1.default.basename(file.path)}`;
                const thumbnailUrl = `${CDN_BASE_URL}/uploads/${path_1.default.basename(thumbnailPath)}`;
                // 使用EXIF中的拍摄日期，如果没有则使用当前时间
                const takenAt = exifData.takenAt ? new Date(exifData.takenAt) : new Date();
                // 递增orderIndex，避免重复
                currentOrderIndex++;
                // 处理标签 (Assuming tags is passed as JSON stringified array of arrays or just common tags)
                // For simplicity in bulk, we might just apply the same tags to all, or parse based on index if client sends array
                // Here we assume tags are common for the batch if provided
                let tagConnect = [];
                if (tags) {
                    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
                    // If client sends array of tags per file, this logic needs to be more complex.
                    // But usually bulk upload shares context.
                    // If `tags` is Array<string>, apply to all.
                    if (Array.isArray(parsedTags)) {
                        for (const tagName of parsedTags) {
                            tagConnect.push({
                                where: { name: tagName },
                                create: { name: tagName }
                            });
                        }
                    }
                }
                return index_1.prisma.photo.create({
                    data: {
                        title: title || `照片_${Date.now()}_${Math.round(Math.random() * 1E6)}`,
                        description,
                        categoryId: parseInt(categoryId),
                        isFeatured: isFeatured === 'true' || isFeatured === true,
                        isVisible: isVisible === 'true' || isVisible === true,
                        orderIndex: currentOrderIndex,
                        takenAt,
                        imageUrl,
                        thumbnailUrl,
                        exifData,
                        width: metadata.width,
                        height: metadata.height,
                        size: metadata.size,
                        tags: {
                            connectOrCreate: tagConnect
                        }
                    },
                    include: { tags: true }
                });
            }
            catch (error) {
                console.error(`上传文件失败 ${file.originalname}:`, error);
                return null;
            }
        }));
        // 过滤掉失败的上传
        const successfulUploads = uploadResults.filter((result) => result !== null);
        res.json({
            message: `批量上传完成，成功${successfulUploads.length}张，失败${uploadResults.length - successfulUploads.length}张`,
            photos: successfulUploads,
        });
    }
    catch (error) {
        console.error('批量上传作品失败:', error);
        res.status(500).json({ error: '批量上传作品失败' });
    }
};
exports.bulkUploadPhotos = bulkUploadPhotos;
// 更新作品
const updatePhoto = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, imageUrl, thumbnailUrl, categoryId, isFeatured, isVisible, orderIndex, takenAt, exifData, } = req.body;
        // 验证照片是否存在
        const existingPhoto = await index_1.prisma.photo.findUnique({
            where: { id: parseInt(id) },
        });
        if (!existingPhoto) {
            throw new errorHandler_1.AppError(`作品ID ${id} 不存在`, 404);
        }
        // 如果提供了categoryId，验证分类是否存在
        if (categoryId !== undefined) {
            const category = await index_1.prisma.photoCategory.findUnique({
                where: { id: parseInt(categoryId) },
            });
            if (!category) {
                throw new errorHandler_1.AppError(`分类ID ${categoryId} 不存在`, 404);
            }
        }
        const photo = await index_1.prisma.photo.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                imageUrl,
                thumbnailUrl,
                categoryId,
                isFeatured,
                isVisible,
                orderIndex,
                takenAt,
                exifData,
            },
        });
        res.json(photo);
    }
    catch (error) {
        console.error('更新作品失败:', {
            timestamp: new Date().toISOString(),
            error,
            request: {
                path: req.path,
                method: req.method,
                params: req.params,
                body: req.body,
            },
        });
        if (error instanceof errorHandler_1.AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        res.status(500).json({ error: '更新作品失败' });
    }
};
exports.updatePhoto = updatePhoto;
// 删除作品
const deletePhoto = async (req, res) => {
    try {
        const { id } = req.params;
        // 验证照片是否存在
        const existingPhoto = await index_1.prisma.photo.findUnique({
            where: { id: parseInt(id) },
        });
        if (!existingPhoto) {
            throw new errorHandler_1.AppError(`作品ID ${id} 不存在`, 404);
        }
        await index_1.prisma.photo.delete({ where: { id: parseInt(id) } });
        res.json({ message: '作品删除成功' });
    }
    catch (error) {
        console.error('删除作品失败:', {
            timestamp: new Date().toISOString(),
            error,
            request: {
                path: req.path,
                method: req.method,
                params: req.params,
            },
        });
        if (error instanceof errorHandler_1.AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        res.status(500).json({ error: '删除作品失败' });
    }
};
exports.deletePhoto = deletePhoto;
// 获取单个作品
const getPhoto = async (req, res) => {
    try {
        const { id } = req.params;
        const photo = await index_1.prisma.photo.findUnique({
            where: { id: parseInt(id) },
            include: {
                category: {
                    select: { id: true, name: true, slug: true },
                },
            },
        });
        res.json(photo);
    }
    catch (error) {
        res.status(500).json({ error: '获取作品失败' });
    }
};
exports.getPhoto = getPhoto;
// 批量更新作品排序
const updatePhotosOrder = async (req, res) => {
    try {
        const { photos } = req.body;
        const updatedPhotos = await Promise.all(photos.map((photo) => {
            return index_1.prisma.photo.update({
                where: { id: photo.id },
                data: { orderIndex: photo.orderIndex },
            });
        }));
        res.json(updatedPhotos);
    }
    catch (error) {
        res.status(500).json({ error: '更新作品排序失败' });
    }
};
exports.updatePhotosOrder = updatePhotosOrder;
// 批量删除作品
const batchDeletePhotos = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: '请提供要删除的作品ID列表' });
        }
        const photoIds = ids.map((id) => parseInt(id));
        // Get all photos to be deleted to get their file paths
        const photosToDelete = await index_1.prisma.photo.findMany({
            where: {
                id: { in: photoIds }
            }
        });
        // Delete files from disk
        const uploadDir = path_1.default.join(process.cwd(), 'uploads');
        photosToDelete.forEach(photo => {
            try {
                if (photo.imageUrl) {
                    const filename = path_1.default.basename(photo.imageUrl);
                    const filePath = path_1.default.join(uploadDir, filename);
                    if (fs_1.default.existsSync(filePath))
                        fs_1.default.unlinkSync(filePath);
                }
                if (photo.thumbnailUrl) {
                    const filename = path_1.default.basename(photo.thumbnailUrl);
                    const filePath = path_1.default.join(uploadDir, filename);
                    if (fs_1.default.existsSync(filePath))
                        fs_1.default.unlinkSync(filePath);
                }
            }
            catch (err) {
                console.error(`Failed to delete files for photo ${photo.id}:`, err);
            }
        });
        await index_1.prisma.photo.deleteMany({
            where: {
                id: { in: photoIds }
            }
        });
        res.json({ message: '批量删除成功' });
    }
    catch (error) {
        console.error('批量删除作品失败:', error);
        res.status(500).json({ error: '批量删除作品失败' });
    }
};
exports.batchDeletePhotos = batchDeletePhotos;
// 批量分类作品
const batchUpdateCategory = async (req, res) => {
    try {
        const { ids, categoryId } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: '请提供要更新的作品ID列表' });
        }
        if (!categoryId) {
            return res.status(400).json({ error: '请提供新的分类ID' });
        }
        const category = await index_1.prisma.photoCategory.findUnique({
            where: { id: parseInt(categoryId) }
        });
        if (!category) {
            return res.status(404).json({ error: '分类不存在' });
        }
        await index_1.prisma.photo.updateMany({
            where: {
                id: { in: ids.map((id) => parseInt(id)) }
            },
            data: {
                categoryId: parseInt(categoryId)
            }
        });
        res.json({ message: '批量分类成功' });
    }
    catch (error) {
        console.error('批量分类作品失败:', error);
        res.status(500).json({ error: '批量分类作品失败' });
    }
};
exports.batchUpdateCategory = batchUpdateCategory;
//# sourceMappingURL=photoController.js.map