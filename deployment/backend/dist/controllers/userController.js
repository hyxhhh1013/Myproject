"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = exports.uploadAvatar = void 0;
const index_1 = require("../index");
const path_1 = __importDefault(require("path"));
// Upload avatar
const uploadAvatar = async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'Please upload a file' });
        }
        const CDN_BASE_URL = process.env.CDN_BASE_URL || '';
        const avatarUrl = `${CDN_BASE_URL}/uploads/${path_1.default.basename(file.path)}`;
        const user = await index_1.prisma.user.update({
            where: { id: parseInt(id) },
            data: { avatar: avatarUrl },
        });
        res.json({ status: 'success', message: 'Avatar updated', data: { avatar: avatarUrl } });
    }
    catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ status: 'error', message: 'Failed to upload avatar' });
    }
};
exports.uploadAvatar = uploadAvatar;
// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await index_1.prisma.user.findMany({
            include: {
                education: true,
                experience: true,
                skills: true,
                projects: true,
                contacts: true,
                socialMedia: true,
            },
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get users' });
    }
};
exports.getAllUsers = getAllUsers;
// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await index_1.prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: {
                education: true,
                experience: true,
                skills: true,
                projects: true,
                contacts: true,
                socialMedia: true,
            },
        });
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get user' });
    }
};
exports.getUserById = getUserById;
// Create user
const createUser = async (req, res) => {
    try {
        const { name, title, bio, avatar, email, phone, location } = req.body;
        const user = await index_1.prisma.user.create({
            data: {
                name,
                title,
                bio,
                avatar,
                email,
                phone,
                location,
            },
        });
        res.status(201).json({ status: 'success', message: 'User created successfully', data: user });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create user' });
    }
};
exports.createUser = createUser;
// Update user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, title, bio, avatar, email, phone, location } = req.body;
        const user = await index_1.prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                name,
                title,
                bio,
                avatar,
                email,
                phone,
                location,
            },
        });
        res.status(200).json({ status: 'success', message: 'User updated successfully', data: user });
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update user' });
    }
};
exports.updateUser = updateUser;
// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.user.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ status: 'success', message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete user' });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=userController.js.map