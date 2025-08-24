// src/controllers/exercise.controller.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { Exercise } from '../entities/Exercise';
import { Category } from '../entities/Category';
import { ExerciseLevelDetail } from '../entities/ExerciseLevelDetail';

const exerciseRepo = AppDataSource.getRepository(Exercise);
const categoryRepo = AppDataSource.getRepository(Category);
const levelDetailRepo = AppDataSource.getRepository(ExerciseLevelDetail);


export const createExercise = async (req: Request, res: Response) => {
  try {
    const { name, description, categoryId, levelDetails, equipment, videoUrl } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ message: 'Name and Category ID are required' });
    }

    const category = await categoryRepo.findOne({ where: { id: categoryId } });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const exercise = exerciseRepo.create({
      name,
      description,
      category,
      equipment,
      videoUrl,
    });

    const savedExercise = await exerciseRepo.save(exercise);

    if (Array.isArray(levelDetails)) {
      const details = levelDetails.map((detail) =>
        levelDetailRepo.create({
          ...detail,
          exercise: savedExercise,
        }),
      );
const flatDetails = details.flat(); // ✅ convert to ExerciseLevelDetail[]
await levelDetailRepo.save(flatDetails);    }

    const finalExercise = await exerciseRepo.findOne({
      where: { id: savedExercise.id },
      relations: ['levelDetails'],
    });

    return res.status(201).json({ message: 'Exercise created', data: finalExercise });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
};
export const getAllExercises = async (req: Request, res: Response) => {
  try {
    const categoryId = req.query.category as string | undefined;

    const exercises = await exerciseRepo.find({
      where: categoryId ? { category: { id: Number(categoryId) } } : {},
      relations: ['category'],
    });

    return res.status(200).json({ data: exercises });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
};



export const getExerciseById = async (req: Request, res: Response) => {
  try {
    const  id  = req.query.exerciseId;
    const exercise = await exerciseRepo.findOne({
      where: { id: Number(id) },
      relations: ['category'],
    });

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    return res.status(200).json({ data: exercise });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
};




export const updateExercise = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, image, video, categoryId } = req.body;

    const exercise = await exerciseRepo.findOne({ where: { id: Number(id) } });
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    if (categoryId) {
      const category = await categoryRepo.findOne({ where: { id: categoryId } });
      if (!category) return res.status(404).json({ message: 'Category not found' });
      exercise.category = category;
    }

    Object.assign(exercise, { name, description, image, video });
    await exerciseRepo.save(exercise);

    return res.status(200).json({ message: 'Exercise updated', data: exercise });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
};
export const deleteExercise = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const exercise = await exerciseRepo.findOne({ where: { id: Number(id) } });
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    await exerciseRepo.remove(exercise);

    return res.status(200).json({ message: 'Exercise deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
};
