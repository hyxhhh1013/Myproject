"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBeenCount = exports.updateWantCount = exports.updateTravelCityOrder = exports.deleteTravelCity = exports.updateTravelCity = exports.createTravelCity = exports.getTravelCities = void 0;
const index_1 = require("../index");
/**
 * 获取所有旅行城市
 */
const getTravelCities = async (req, res) => {
    try {
        const cities = await index_1.prisma.travelCity.findMany({
            where: { isVisible: true },
            orderBy: { orderIndex: 'asc' }
        });
        res.json(cities);
    }
    catch (error) {
        console.error('获取旅行城市失败:', error);
        res.status(500).json({ error: '获取旅行城市失败' });
    }
};
exports.getTravelCities = getTravelCities;
/**
 * 创建旅行城市
 */
const createTravelCity = async (req, res) => {
    try {
        const { name, longitude, latitude, note, wantCount, beenCount, orderIndex, isVisible } = req.body;
        const city = await index_1.prisma.travelCity.create({
            data: {
                name,
                longitude,
                latitude,
                note,
                wantCount: wantCount || 0,
                beenCount: beenCount || 0,
                orderIndex: orderIndex || 0,
                isVisible: isVisible !== false
            }
        });
        res.status(201).json(city);
    }
    catch (error) {
        console.error('创建旅行城市失败:', error);
        res.status(500).json({ error: '创建旅行城市失败' });
    }
};
exports.createTravelCity = createTravelCity;
/**
 * 更新旅行城市
 */
const updateTravelCity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, longitude, latitude, note, wantCount, beenCount, orderIndex, isVisible } = req.body;
        const city = await index_1.prisma.travelCity.update({
            where: { id: parseInt(id) },
            data: {
                name,
                longitude,
                latitude,
                note,
                wantCount,
                beenCount,
                orderIndex,
                isVisible
            }
        });
        res.json(city);
    }
    catch (error) {
        console.error('更新旅行城市失败:', error);
        res.status(500).json({ error: '更新旅行城市失败' });
    }
};
exports.updateTravelCity = updateTravelCity;
/**
 * 删除旅行城市
 */
const deleteTravelCity = async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.travelCity.delete({
            where: { id: parseInt(id) }
        });
        res.json({ status: 'success', message: '删除成功' });
    }
    catch (error) {
        console.error('删除旅行城市失败:', error);
        res.status(500).json({ error: '删除旅行城市失败' });
    }
};
exports.deleteTravelCity = deleteTravelCity;
/**
 * 更新旅行城市排序
 */
const updateTravelCityOrder = async (req, res) => {
    try {
        const { cityIds } = req.body;
        // 使用事务确保所有更新都成功
        await index_1.prisma.$transaction(cityIds.map((id, index) => index_1.prisma.travelCity.update({
            where: { id },
            data: { orderIndex: index }
        })));
        res.json({ status: 'success', message: '排序更新成功' });
    }
    catch (error) {
        console.error('更新旅行城市排序失败:', error);
        res.status(500).json({ error: '更新旅行城市排序失败' });
    }
};
exports.updateTravelCityOrder = updateTravelCityOrder;
/**
 * 更新旅行城市想去人数
 */
const updateWantCount = async (req, res) => {
    try {
        const { id } = req.params;
        const { increment } = req.body;
        const city = await index_1.prisma.travelCity.update({
            where: { id: parseInt(id) },
            data: {
                wantCount: { increment: increment || 0 }
            }
        });
        res.json(city);
    }
    catch (error) {
        console.error('更新旅行城市想去人数失败:', error);
        res.status(500).json({ error: '更新旅行城市想去人数失败' });
    }
};
exports.updateWantCount = updateWantCount;
/**
 * 更新旅行城市去过人数
 */
const updateBeenCount = async (req, res) => {
    try {
        const { id } = req.params;
        const { increment } = req.body;
        const city = await index_1.prisma.travelCity.update({
            where: { id: parseInt(id) },
            data: {
                beenCount: { increment: increment || 0 }
            }
        });
        res.json(city);
    }
    catch (error) {
        console.error('更新旅行城市去过人数失败:', error);
        res.status(500).json({ error: '更新旅行城市去过人数失败' });
    }
};
exports.updateBeenCount = updateBeenCount;
//# sourceMappingURL=travelCityController.js.map