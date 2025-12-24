"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMovieLikes = exports.updateMovieOrder = exports.deleteMovie = exports.updateMovie = exports.createMovie = exports.getMovies = void 0;
const index_1 = require("../index");
/**
 * 获取所有电影
 */
const getMovies = async (req, res) => {
    try {
        const movies = await index_1.prisma.movie.findMany({
            where: { isVisible: true },
            orderBy: { orderIndex: 'asc' }
        });
        res.json(movies);
    }
    catch (error) {
        console.error('获取电影失败:', error);
        res.status(500).json({ error: '获取电影失败' });
    }
};
exports.getMovies = getMovies;
/**
 * 创建电影
 */
const createMovie = async (req, res) => {
    try {
        const { title, year, poster, rating, likes, orderIndex, isVisible } = req.body;
        const movie = await index_1.prisma.movie.create({
            data: {
                title,
                year,
                poster,
                rating,
                likes: likes || 0,
                orderIndex: orderIndex || 0,
                isVisible: isVisible !== false
            }
        });
        res.status(201).json(movie);
    }
    catch (error) {
        console.error('创建电影失败:', error);
        res.status(500).json({ error: '创建电影失败' });
    }
};
exports.createMovie = createMovie;
/**
 * 更新电影
 */
const updateMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, year, poster, rating, likes, orderIndex, isVisible } = req.body;
        const movie = await index_1.prisma.movie.update({
            where: { id: parseInt(id) },
            data: {
                title,
                year,
                poster,
                rating,
                likes,
                orderIndex,
                isVisible
            }
        });
        res.json(movie);
    }
    catch (error) {
        console.error('更新电影失败:', error);
        res.status(500).json({ error: '更新电影失败' });
    }
};
exports.updateMovie = updateMovie;
/**
 * 删除电影
 */
const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.movie.delete({
            where: { id: parseInt(id) }
        });
        res.json({ status: 'success', message: '删除成功' });
    }
    catch (error) {
        console.error('删除电影失败:', error);
        res.status(500).json({ error: '删除电影失败' });
    }
};
exports.deleteMovie = deleteMovie;
/**
 * 更新电影排序
 */
const updateMovieOrder = async (req, res) => {
    try {
        const { movieIds } = req.body;
        // 使用事务确保所有更新都成功
        await index_1.prisma.$transaction(movieIds.map((id, index) => index_1.prisma.movie.update({
            where: { id },
            data: { orderIndex: index }
        })));
        res.json({ status: 'success', message: '排序更新成功' });
    }
    catch (error) {
        console.error('更新电影排序失败:', error);
        res.status(500).json({ error: '更新电影排序失败' });
    }
};
exports.updateMovieOrder = updateMovieOrder;
/**
 * 更新电影点赞数
 */
const updateMovieLikes = async (req, res) => {
    try {
        const { id } = req.params;
        const { increment } = req.body;
        const movie = await index_1.prisma.movie.update({
            where: { id: parseInt(id) },
            data: {
                likes: { increment: increment || 0 }
            }
        });
        res.json(movie);
    }
    catch (error) {
        console.error('更新电影点赞数失败:', error);
        res.status(500).json({ error: '更新电影点赞数失败' });
    }
};
exports.updateMovieLikes = updateMovieLikes;
//# sourceMappingURL=movieController.js.map