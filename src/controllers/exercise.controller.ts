// src/controllers/exercise.controller.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { Exercise } from '../entities/Exercise';
import { Category } from '../entities/Category';
import { ExerciseLevelDetail } from '../entities/ExerciseLevelDetail';
import { DifficultyLevel } from '../utils/enum';

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
      const details = levelDetails.map((detail: any) => {
        // Validate enum
        if (!Object.values(DifficultyLevel).includes(detail.level)) {
          throw new Error(`Invalid level: ${detail.level}`);
        }

        return levelDetailRepo.create({
          exercise: savedExercise,
          level: detail.level,
          sets: detail.sets ?? null,
          reps: detail.reps ?? null,
          durationMinutes: detail.durationMinutes ?? null,
        });
      });

      await levelDetailRepo.save(details);
    }


    const finalExercise = await exerciseRepo.findOne({
      where: { id: savedExercise.id },
      relations: ["category",'levelDetails'],
    });

    return res.status(201).json({ message: 'Exercise created', data: finalExercise });
  } catch (err) {
    console.log(err)
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
      relations: ['category','levelDetails'],
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
    const { id } = req.query; // ✅ get exercise id from URL
    const { name, description, categoryId, levelDetails, equipment, videoUrl } = req.body;

    const exerciseId = Number(id);
    if (isNaN(exerciseId)) {
      return res.status(400).json({ success: false, message: "Invalid exercise ID" });
    }

    const exerciseRepo = AppDataSource.getRepository(Exercise);
    const categoryRepo = AppDataSource.getRepository(Category);
    const levelDetailRepo = AppDataSource.getRepository(ExerciseLevelDetail);

    const exercise = await exerciseRepo.findOne({
      where: { id: exerciseId },
      relations: ["category", "levelDetails"],
    });

    if (!exercise) {
      return res.status(404).json({ success: false, message: "Exercise not found" });
    }

    // ✅ update fields
    if (name) exercise.name = name;
    if (description) exercise.description = description;
    if (equipment) exercise.equipment = equipment;
    if (videoUrl) exercise.videoUrl = videoUrl;

    // ✅ handle category update
    if (categoryId) {
      const category = await categoryRepo.findOneBy({ id: categoryId });
      if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" });
      }
      exercise.category = category;
    }

    // ✅ save updated exercise first
    await exerciseRepo.save(exercise);

    // ✅ update level details if provided
    if (Array.isArray(levelDetails)) {
      // remove old level details
      await levelDetailRepo.delete({ exercise: { id: exercise.id } });

      // add new ones
      const details = levelDetails.map((detail: any) => {
        if (!Object.values(DifficultyLevel).includes(detail.level)) {
          throw new Error(`Invalid level: ${detail.level}`);
        }

        return levelDetailRepo.create({
          exercise,
          level: detail.level,
          sets: detail.sets ?? null,
          reps: detail.reps ?? null,
          durationMinutes: detail.durationMinutes ?? null,
        });
      });

      await levelDetailRepo.save(details);
    }

    // ✅ get final updated exercise with relations
    const updatedExercise = await exerciseRepo.findOne({
      where: { id: exercise.id },
      relations: ["category", "levelDetails"],
    });

    return res.status(200).json({
      success: true,
      message: "Exercise updated successfully",
      data: updatedExercise,
    });

  } catch (err) {
    console.error("Update Exercise Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err instanceof Error ? err.message : err,
    });
  }
};







export const deleteExercise = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const exerciseId = Number(id);
    if (isNaN(exerciseId)) {
      return res.status(400).json({ success: false, message: "Invalid exercise ID" });
    }

    const exerciseRepo = AppDataSource.getRepository(Exercise);
    const levelDetailRepo = AppDataSource.getRepository(ExerciseLevelDetail);

    // Find exercise with relations
    const exercise = await exerciseRepo.findOne({
      where: { id: exerciseId },
      relations: ["levelDetails"],
    });

    if (!exercise) {
      return res.status(404).json({ success: false, message: "Exercise not found" });
    }

    // First delete related level details (if you don't have cascade delete in entity)
    if (exercise.levelDetails && exercise.levelDetails.length > 0) {
      await levelDetailRepo.delete({ exercise: { id: exercise.id } });
    }

    // Then delete exercise itself
    await exerciseRepo.remove(exercise);

    return res.status(200).json({ 
      success: true, 
      message: "Exercise deleted successfully" 
    });
  } catch (err) {
    console.error("Delete Exercise Error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err instanceof Error ? err.message : err 
    });
  }
};




export const getExercisesByLevel = async (req: Request, res: Response) => {
  try {
    const level = req.query.level as DifficultyLevel;

    const exercises = await exerciseRepo.find({
      relations: ['levelDetails', 'category'],
    });

    const filtered = exercises.filter((ex) =>
      ex.levelDetails.some((ld) => ld.level === level),
    );

    return res.status(200).json({ data: filtered });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
};
