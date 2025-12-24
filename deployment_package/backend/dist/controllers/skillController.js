"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSkill = exports.updateSkill = exports.createSkill = exports.getSkillById = exports.getAllSkills = void 0;
const index_1 = require("../index");
// Get all skills
const getAllSkills = async (req, res) => {
    try {
        const skills = await index_1.prisma.skill.findMany({
            include: {
                user: true,
            },
        });
        res.status(200).json(skills);
    }
    catch (error) {
        console.error('Error getting skills:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get skills' });
    }
};
exports.getAllSkills = getAllSkills;
// Get skill by ID
const getSkillById = async (req, res) => {
    try {
        const { id } = req.params;
        const skill = await index_1.prisma.skill.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: true,
            },
        });
        if (!skill) {
            return res.status(404).json({ status: 'error', message: 'Skill not found' });
        }
        res.status(200).json(skill);
    }
    catch (error) {
        console.error('Error getting skill:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get skill' });
    }
};
exports.getSkillById = getSkillById;
// Create skill
const createSkill = async (req, res) => {
    try {
        const { userId, name, level, category } = req.body;
        const skill = await index_1.prisma.skill.create({
            data: {
                userId,
                name,
                level,
                category,
            },
        });
        res.status(201).json({ status: 'success', message: 'Skill created successfully', data: skill });
    }
    catch (error) {
        console.error('Error creating skill:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create skill' });
    }
};
exports.createSkill = createSkill;
// Update skill
const updateSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, level, category } = req.body;
        const skill = await index_1.prisma.skill.update({
            where: { id: parseInt(id) },
            data: {
                name,
                level,
                category,
            },
        });
        res.status(200).json({ status: 'success', message: 'Skill updated successfully', data: skill });
    }
    catch (error) {
        console.error('Error updating skill:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update skill' });
    }
};
exports.updateSkill = updateSkill;
// Delete skill
const deleteSkill = async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.skill.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ status: 'success', message: 'Skill deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting skill:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete skill' });
    }
};
exports.deleteSkill = deleteSkill;
//# sourceMappingURL=skillController.js.map