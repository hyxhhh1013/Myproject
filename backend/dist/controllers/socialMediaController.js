"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSocialMedia = exports.updateSocialMedia = exports.createSocialMedia = exports.getSocialMediaById = exports.getAllSocialMedia = void 0;
const index_1 = require("../index");
// Get all social media records
const getAllSocialMedia = async (req, res) => {
    try {
        const socialMedia = await index_1.prisma.socialMedia.findMany({
            include: {
                user: true,
            },
        });
        res.status(200).json(socialMedia);
    }
    catch (error) {
        console.error('Error getting social media records:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get social media records' });
    }
};
exports.getAllSocialMedia = getAllSocialMedia;
// Get social media by ID
const getSocialMediaById = async (req, res) => {
    try {
        const { id } = req.params;
        const socialMedia = await index_1.prisma.socialMedia.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: true,
            },
        });
        if (!socialMedia) {
            return res.status(404).json({ status: 'error', message: 'Social media record not found' });
        }
        res.status(200).json(socialMedia);
    }
    catch (error) {
        console.error('Error getting social media record:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get social media record' });
    }
};
exports.getSocialMediaById = getSocialMediaById;
// Create social media record
const createSocialMedia = async (req, res) => {
    try {
        const { userId, platform, url } = req.body;
        const socialMedia = await index_1.prisma.socialMedia.create({
            data: {
                userId,
                platform,
                url,
            },
        });
        res.status(201).json({ status: 'success', message: 'Social media record created successfully', data: socialMedia });
    }
    catch (error) {
        console.error('Error creating social media record:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create social media record' });
    }
};
exports.createSocialMedia = createSocialMedia;
// Update social media record
const updateSocialMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const { platform, url } = req.body;
        const socialMedia = await index_1.prisma.socialMedia.update({
            where: { id: parseInt(id) },
            data: {
                platform,
                url,
            },
        });
        res.status(200).json({ status: 'success', message: 'Social media record updated successfully', data: socialMedia });
    }
    catch (error) {
        console.error('Error updating social media record:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update social media record' });
    }
};
exports.updateSocialMedia = updateSocialMedia;
// Delete social media record
const deleteSocialMedia = async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.socialMedia.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ status: 'success', message: 'Social media record deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting social media record:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete social media record' });
    }
};
exports.deleteSocialMedia = deleteSocialMedia;
//# sourceMappingURL=socialMediaController.js.map