// src/controllers/category.controller.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { Category } from '../entities/Category';

const categoryRepo = AppDataSource.getRepository(Category);

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name,image } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const category = categoryRepo.create({ name,image });
    await categoryRepo.save(category);
    return res.status(201).json({ message: 'Category created', data: category });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getAllCategories = async (_: Request, res: Response) => {
  try {
    const categories = await categoryRepo.find();
    return res.status(200).json({ data: categories });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
};
