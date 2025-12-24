import { Request, Response } from 'express';
import { prisma } from '../index';

// Get all contacts
export const getAllContacts = async (req: Request, res: Response) => {
  try {
    const contacts = await prisma.contact.findMany({
      include: {
        user: true,
      },
    });
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error getting contacts:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get contacts' });
  }
};

// Get contact by ID
export const getContactById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contact = await prisma.contact.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
      },
    });

    if (!contact) {
      return res.status(404).json({ status: 'error', message: 'Contact not found' });
    }

    res.status(200).json(contact);
  } catch (error) {
    console.error('Error getting contact:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get contact' });
  }
};

// Create contact
export const createContact = async (req: Request, res: Response) => {
  try {
    const { userId, type, value } = req.body;

    const contact = await prisma.contact.create({
      data: {
        userId,
        type,
        value,
      },
    });

    res.status(201).json({ status: 'success', message: 'Contact created successfully', data: contact });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create contact' });
  }
};

// Update contact
export const updateContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, value } = req.body;

    const contact = await prisma.contact.update({
      where: { id: parseInt(id) },
      data: {
        type,
        value,
      },
    });

    res.status(200).json({ status: 'success', message: 'Contact updated successfully', data: contact });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update contact' });
  }
};

// Delete contact
export const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.contact.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ status: 'success', message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete contact' });
  }
};