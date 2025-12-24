"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContact = exports.updateContact = exports.createContact = exports.getContactById = exports.getAllContacts = void 0;
const index_1 = require("../index");
// Get all contacts
const getAllContacts = async (req, res) => {
    try {
        const contacts = await index_1.prisma.contact.findMany({
            include: {
                user: true,
            },
        });
        res.status(200).json(contacts);
    }
    catch (error) {
        console.error('Error getting contacts:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get contacts' });
    }
};
exports.getAllContacts = getAllContacts;
// Get contact by ID
const getContactById = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await index_1.prisma.contact.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: true,
            },
        });
        if (!contact) {
            return res.status(404).json({ status: 'error', message: 'Contact not found' });
        }
        res.status(200).json(contact);
    }
    catch (error) {
        console.error('Error getting contact:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get contact' });
    }
};
exports.getContactById = getContactById;
// Create contact
const createContact = async (req, res) => {
    try {
        const { userId, type, value } = req.body;
        const contact = await index_1.prisma.contact.create({
            data: {
                userId,
                type,
                value,
            },
        });
        res.status(201).json({ status: 'success', message: 'Contact created successfully', data: contact });
    }
    catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create contact' });
    }
};
exports.createContact = createContact;
// Update contact
const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, value } = req.body;
        const contact = await index_1.prisma.contact.update({
            where: { id: parseInt(id) },
            data: {
                type,
                value,
            },
        });
        res.status(200).json({ status: 'success', message: 'Contact updated successfully', data: contact });
    }
    catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update contact' });
    }
};
exports.updateContact = updateContact;
// Delete contact
const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.contact.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ status: 'success', message: 'Contact deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete contact' });
    }
};
exports.deleteContact = deleteContact;
//# sourceMappingURL=contactController.js.map