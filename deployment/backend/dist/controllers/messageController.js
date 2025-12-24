"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.deleteMessage = exports.getAllMessages = exports.createMessage = void 0;
const index_1 = require("../index");
// Create a new message (Public)
const createMessage = async (req, res) => {
    try {
        const { name, email, subject, content } = req.body;
        if (!name || !email || !subject || !content) {
            return res.status(400).json({ status: 'error', message: 'All fields are required' });
        }
        const message = await index_1.prisma.message.create({
            data: {
                name,
                email,
                subject,
                content,
            },
        });
        res.status(201).json({ status: 'success', message: 'Message sent successfully', data: message });
    }
    catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ status: 'error', message: 'Failed to send message' });
    }
};
exports.createMessage = createMessage;
// Get all messages (Admin)
const getAllMessages = async (req, res) => {
    try {
        const messages = await index_1.prisma.message.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json(messages);
    }
    catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get messages' });
    }
};
exports.getAllMessages = getAllMessages;
// Delete a message (Admin)
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.message.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ status: 'success', message: 'Message deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete message' });
    }
};
exports.deleteMessage = deleteMessage;
// Mark message as read (Admin)
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await index_1.prisma.message.update({
            where: { id: parseInt(id) },
            data: { isRead: true },
        });
        res.status(200).json({ status: 'success', message: 'Message marked as read', data: message });
    }
    catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update message' });
    }
};
exports.markAsRead = markAsRead;
//# sourceMappingURL=messageController.js.map