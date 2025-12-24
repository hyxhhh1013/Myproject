"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMusicOrder = exports.deleteMusic = exports.updateMusic = exports.createMusic = exports.getMusic = void 0;
const index_1 = require("../index");
/**
 * 获取所有音乐配置
 */
const getMusic = async (req, res) => {
    try {
        const musicList = await index_1.prisma.music.findMany({
            where: { isVisible: true },
            orderBy: { orderIndex: 'asc' }
        });
        res.json(musicList);
    }
    catch (error) {
        console.error('获取音乐配置失败:', error);
        res.status(500).json({ error: '获取音乐配置失败' });
    }
};
exports.getMusic = getMusic;
/**
 * 创建音乐配置
 */
const createMusic = async (req, res) => {
    try {
        const { title, description, playlistId, playlistType, orderIndex, isVisible } = req.body;
        const music = await index_1.prisma.music.create({
            data: {
                title,
                description,
                playlistId,
                playlistType,
                orderIndex: orderIndex || 0,
                isVisible: isVisible !== false
            }
        });
        res.status(201).json(music);
    }
    catch (error) {
        console.error('创建音乐配置失败:', error);
        res.status(500).json({ error: '创建音乐配置失败' });
    }
};
exports.createMusic = createMusic;
/**
 * 更新音乐配置
 */
const updateMusic = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, playlistId, playlistType, orderIndex, isVisible } = req.body;
        const music = await index_1.prisma.music.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                playlistId,
                playlistType,
                orderIndex,
                isVisible
            }
        });
        res.json(music);
    }
    catch (error) {
        console.error('更新音乐配置失败:', error);
        res.status(500).json({ error: '更新音乐配置失败' });
    }
};
exports.updateMusic = updateMusic;
/**
 * 删除音乐配置
 */
const deleteMusic = async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.music.delete({
            where: { id: parseInt(id) }
        });
        res.json({ status: 'success', message: '删除成功' });
    }
    catch (error) {
        console.error('删除音乐配置失败:', error);
        res.status(500).json({ error: '删除音乐配置失败' });
    }
};
exports.deleteMusic = deleteMusic;
/**
 * 更新音乐排序
 */
const updateMusicOrder = async (req, res) => {
    try {
        const { musicIds } = req.body;
        // 使用事务确保所有更新都成功
        await index_1.prisma.$transaction(musicIds.map((id, index) => index_1.prisma.music.update({
            where: { id },
            data: { orderIndex: index }
        })));
        res.json({ status: 'success', message: '排序更新成功' });
    }
    catch (error) {
        console.error('更新音乐排序失败:', error);
        res.status(500).json({ error: '更新音乐排序失败' });
    }
};
exports.updateMusicOrder = updateMusicOrder;
//# sourceMappingURL=musicController.js.map