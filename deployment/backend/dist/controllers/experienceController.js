"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExperience = exports.updateExperience = exports.createExperience = exports.getExperienceById = exports.getAllExperience = void 0;
const index_1 = require("../index");
// Get all experience records
const getAllExperience = async (req, res) => {
    try {
        const experience = await index_1.prisma.experience.findMany({
            include: {
                user: true,
            },
        });
        res.status(200).json(experience);
    }
    catch (error) {
        console.error('Error getting experience records:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get experience records' });
    }
};
exports.getAllExperience = getAllExperience;
// Get experience by ID
const getExperienceById = async (req, res) => {
    try {
        const { id } = req.params;
        const experience = await index_1.prisma.experience.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: true,
            },
        });
        if (!experience) {
            return res.status(404).json({ status: 'error', message: 'Experience record not found' });
        }
        res.status(200).json(experience);
    }
    catch (error) {
        console.error('Error getting experience record:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get experience record' });
    }
};
exports.getExperienceById = getExperienceById;
// Create experience record
const createExperience = async (req, res) => {
    try {
        const { userId, company, position, startDate, endDate, description } = req.body;
        const experience = await index_1.prisma.experience.create({
            data: {
                userId,
                company,
                position,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                description,
            },
        });
        res.status(201).json({ status: 'success', message: 'Experience record created successfully', data: experience });
    }
    catch (error) {
        console.error('Error creating experience record:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create experience record' });
    }
};
exports.createExperience = createExperience;
// Update experience record
const updateExperience = async (req, res) => {
    try {
        const { id } = req.params;
        const { company, position, startDate, endDate, description } = req.body;
        const experience = await index_1.prisma.experience.update({
            where: { id: parseInt(id) },
            data: {
                company,
                position,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                description,
            },
        });
        res.status(200).json({ status: 'success', message: 'Experience record updated successfully', data: experience });
    }
    catch (error) {
        console.error('Error updating experience record:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update experience record' });
    }
};
exports.updateExperience = updateExperience;
// Delete experience record
const deleteExperience = async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.experience.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ status: 'success', message: 'Experience record deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting experience record:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete experience record' });
    }
};
exports.deleteExperience = deleteExperience;
//# sourceMappingURL=experienceController.js.map