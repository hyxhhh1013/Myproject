import { Request, Response } from 'express';
import { prisma } from '../index';
import { asyncHandler } from '../middleware/asyncHandler';

export const getAllContacts = asyncHandler(async (req: Request, res: Response) => {
  const contacts = await prisma.contact.findMany({ include: { user: true } });
  res.status(200).json(contacts);
});

export const getContactById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const contact = await prisma.contact.findUnique({
    where: { id: parseInt(id) },
    include: { user: true },
  });

  if (!contact) {
    return res.status(404).json({ status: 'error', message: 'Contact not found' });
  }

  res.status(200).json(contact);
});

export const createContact = asyncHandler(async (req: Request, res: Response) => {
  const { userId, type, value } = req.body;

  const contact = await prisma.contact.create({
    data: { userId, type, value },
  });

  res.status(201).json({ status: 'success', message: 'Contact created successfully', data: contact });
});

export const updateContact = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type, value } = req.body;

  const contact = await prisma.contact.update({
    where: { id: parseInt(id) },
    data: { type, value },
  });

  res.status(200).json({ status: 'success', message: 'Contact updated successfully', data: contact });
});

export const deleteContact = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.contact.delete({ where: { id: parseInt(id) } });
  res.status(200).json({ status: 'success', message: 'Contact deleted successfully' });
});
