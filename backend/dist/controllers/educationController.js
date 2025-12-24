"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEducation = exports.updateEducation = exports.createEducation = exports.getEducationById = exports.getAllEducation = void 0;
const index_1 = require("../index");
// Get all education records
const getAllEducation = async (req, res) => {
    try {
        const education = await index_1.prisma.education.findMany({
            include: {
                user: true,
            },
        });
        res.status(200).json(education);
    }
    catch (error) {
        console.error('Error getting education records:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get education records' });
    }
};
exports.getAllEducation = getAllEducation;
// Get education by ID
const getEducationById = async (req, res) => {
    try {
        const { id } = req.params;
        const education = await index_1.prisma.education.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: true,
            },
        });
        if (!education) {
            return res.status(404).json({ status: 'error', message: 'Education record not found' });
        }
        res.status(200).json(education);
    }
    catch (error) {
        console.error('Error getting education record:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get education record' });
    }
};
exports.getEducationById = getEducationById;
// Create education record
const createEducation = async (req, res) => {
    try {
        const { userId, school, degree, major, startDate, endDate, description } = req.body;
        const education = await index_1.prisma.education.create({
            data: {
                userId,
                school,
                degree,
                major,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                description,
            },
        });
        res.status(201).json({ status: 'success', message: 'Education record created successfully', data: education });
    }
    catch (error) {
        console.error('Error creating education record:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create education record' });
    }
};
exports.createEducation = createEducation;
// Update education record
const updateEducation = async (req, res) => {
    try {
        const { id } = req.params;
        const { school, degree, major, startDate, endDate, description } = req.body;
        const education = await index_1.prisma.education.update({
            where: { id: parseInt(id) },
            data: {
                school,
                degree,
                major,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                description,
            },
        });
        res.status(200).json({ status: 'success', message: 'Education record updated successfully', data: education });
    }
    catch (error) {
        console.error('Error updating education record:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update education record' });
    }
};
exports.updateEducation = updateEducation;
// Delete education record
const deleteEducation = async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.education.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ status: 'success', message: 'Education record deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting education record:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete education record' });
    }
};
exports.deleteEducation = deleteEducation;
//# sourceMappingURL=educationController.js.map