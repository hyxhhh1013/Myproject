"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProjectDemo = exports.deleteProject = exports.updateProject = exports.createProject = exports.getProjectById = exports.getAllProjects = exports.upload = void 0;
const index_1 = require("../index");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// 配置文件存储
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads/demos';
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
    // 允许上传的文件类型
    const allowedTypes = [
        'image/',
        'video/',
        'application/zip',
        'application/pdf',
        'text/html'
    ];
    const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
    if (isAllowed) {
        cb(null, true);
    }
    else {
        cb(new Error('不允许的文件类型'));
    }
};
// 配置multer
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
    },
});
exports.upload = upload;
// Get all projects
const getAllProjects = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        // 使用Promise.all并行查询项目和总数，提高性能
        const [projects, total] = await Promise.all([
            index_1.prisma.project.findMany({
                include: {
                    // 只选择必要的用户字段，减少数据传输
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: [{ createdAt: 'desc' }], // 添加排序
                skip,
                take: parseInt(limit),
            }),
            index_1.prisma.project.count(), // 获取项目总数
        ]);
        // 返回分页信息
        res.status(200).json({
            status: 'success',
            data: projects,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    }
    catch (error) {
        console.error('Error getting projects:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get projects' });
    }
};
exports.getAllProjects = getAllProjects;
// Get project by ID
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await index_1.prisma.project.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: true,
            },
        });
        if (!project) {
            return res.status(404).json({ status: 'error', message: 'Project not found' });
        }
        res.status(200).json(project);
    }
    catch (error) {
        console.error('Error getting project:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get project' });
    }
};
exports.getProjectById = getProjectById;
// Create project
const createProject = async (req, res) => {
    try {
        const { userId, title, description, startDate, endDate, technologies, githubUrl, demoUrl } = req.body;
        // Handle image upload if present
        const CDN_BASE_URL = process.env.CDN_BASE_URL || '';
        let imageUrl = req.body.imageUrl;
        if (req.file) {
            imageUrl = `${CDN_BASE_URL}/uploads/demos/${path_1.default.basename(req.file.path)}`;
        }
        const project = await index_1.prisma.project.create({
            data: {
                userId: parseInt(userId),
                title,
                description,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                technologies,
                githubUrl,
                demoUrl,
                imageUrl,
            },
        });
        res.status(201).json({ status: 'success', message: 'Project created successfully', data: project });
    }
    catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create project' });
    }
};
exports.createProject = createProject;
// Update project
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, startDate, endDate, technologies, githubUrl, demoUrl } = req.body;
        // Handle image upload if present
        const CDN_BASE_URL = process.env.CDN_BASE_URL || '';
        let imageUrl = req.body.imageUrl;
        if (req.file) {
            imageUrl = `${CDN_BASE_URL}/uploads/demos/${path_1.default.basename(req.file.path)}`;
        }
        const dataToUpdate = {
            title,
            description,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            technologies,
            githubUrl,
            demoUrl,
        };
        if (imageUrl) {
            dataToUpdate.imageUrl = imageUrl;
        }
        const project = await index_1.prisma.project.update({
            where: { id: parseInt(id) },
            data: dataToUpdate,
        });
        res.status(200).json({ status: 'success', message: 'Project updated successfully', data: project });
    }
    catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update project' });
    }
};
exports.updateProject = updateProject;
// Delete project
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.project.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ status: 'success', message: 'Project deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete project' });
    }
};
exports.deleteProject = deleteProject;
// 上传项目Demo
const uploadProjectDemo = async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: '请上传Demo文件' });
        }
        // 模拟CDN地址
        const CDN_BASE_URL = process.env.CDN_BASE_URL || '';
        // 构建Demo文件URL
        const demoUrl = `${CDN_BASE_URL}/uploads/demos/${path_1.default.basename(file.path)}`;
        // 更新项目信息
        const project = await index_1.prisma.project.update({
            where: { id: parseInt(id) },
            data: { demoUrl },
        });
        res.json({ status: 'success', message: 'Demo上传成功', data: project });
    }
    catch (error) {
        console.error('上传Demo失败:', error);
        res.status(500).json({ error: '上传Demo失败' });
    }
};
exports.uploadProjectDemo = uploadProjectDemo;
//# sourceMappingURL=projectController.js.map