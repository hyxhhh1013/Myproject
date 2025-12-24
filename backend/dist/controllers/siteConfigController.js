"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementViewCount = exports.updateSiteConfig = exports.getSiteConfig = void 0;
const index_1 = require("../index");
const getSiteConfig = async (req, res) => {
    try {
        // There should be only one config, if not create one
        let config = await index_1.prisma.siteConfig.findFirst();
        if (!config) {
            config = await index_1.prisma.siteConfig.create({
                data: {}
            });
        }
        // Also get the owner user's bio for "About Me"
        const user = await index_1.prisma.user.findFirst();
        res.json({
            ...config,
            aboutMe: user?.bio || ''
        });
    }
    catch (error) {
        console.error('获取站点配置失败:', error);
        res.status(500).json({ error: '获取站点配置失败' });
    }
};
exports.getSiteConfig = getSiteConfig;
const updateSiteConfig = async (req, res) => {
    try {
        const { siteTitle, seoKeywords, seoDescription, icpCode, aboutMe } = req.body;
        // Update User bio if provided
        if (aboutMe !== undefined) {
            const user = await index_1.prisma.user.findFirst();
            if (user) {
                await index_1.prisma.user.update({
                    where: { id: user.id },
                    data: { bio: aboutMe }
                });
            }
        }
        let config = await index_1.prisma.siteConfig.findFirst();
        if (!config) {
            config = await index_1.prisma.siteConfig.create({
                data: {
                    siteTitle,
                    seoKeywords,
                    seoDescription,
                    icpCode
                }
            });
        }
        else {
            config = await index_1.prisma.siteConfig.update({
                where: { id: config.id },
                data: {
                    siteTitle,
                    seoKeywords,
                    seoDescription,
                    icpCode
                }
            });
        }
        res.json({
            ...config,
            aboutMe // return back the new aboutMe
        });
    }
    catch (error) {
        console.error('更新站点配置失败:', error);
        res.status(500).json({ error: '更新站点配置失败' });
    }
};
exports.updateSiteConfig = updateSiteConfig;
const incrementViewCount = async (req, res) => {
    try {
        const config = await index_1.prisma.siteConfig.findFirst();
        if (config) {
            await index_1.prisma.siteConfig.update({
                where: { id: config.id },
                data: { viewCount: { increment: 1 } }
            });
        }
        res.json({ status: 'success' });
    }
    catch (error) {
        // Silent fail
        res.json({ status: 'error' });
    }
};
exports.incrementViewCount = incrementViewCount;
//# sourceMappingURL=siteConfigController.js.map