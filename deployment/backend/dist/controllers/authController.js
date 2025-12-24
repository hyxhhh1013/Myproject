"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.getMe = exports.login = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check for user email
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (user && (await bcryptjs_1.default.compare(password, user.password))) {
            res.json({
                status: 'success',
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(user.id),
                },
            });
        }
        else {
            res.status(401).json({
                status: 'fail',
                message: 'Invalid email or password',
            });
        }
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });
        if (user) {
            res.json({
                status: 'success',
                data: user,
            });
        }
        else {
            res.status(404).json({
                status: 'fail',
                message: 'User not found',
            });
        }
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server error',
        });
    }
};
exports.getMe = getMe;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: '当前密码错误' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        res.json({ message: '密码修改成功' });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: '修改密码失败' });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=authController.js.map