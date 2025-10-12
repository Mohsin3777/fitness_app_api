// src/controllers/exercise.controller.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { Exercise } from '../entities/Exercise';
import { Category } from '../entities/Category';
import { ExerciseLevelDetail } from '../entities/ExerciseLevelDetail';
import { DifficultyLevel } from '../utils/enum';
import { ResponseClass } from '../utils/response';

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
    console.log(req.query)
    const categoryId = req.query.category as string | undefined;
        const level = req.query.level as string | undefined; // 👈 difficulty level filter

    const rawLimit = parseInt((req.query.limit as string) || "10", 10);
    const rawPage = parseInt((req.query.page as string) || "1", 10);

    const limit = Math.min(Math.max(1, Number.isNaN(rawLimit) ? 10 : rawLimit), 100); // cap 100
    const page = Math.max(1, Number.isNaN(rawPage) ? 1 : rawPage);
    const skip = (page - 1) * limit;

    const qb = exerciseRepo
      .createQueryBuilder("exercise")
      .leftJoinAndSelect("exercise.category", "category")
            .leftJoinAndSelect("exercise.levelDetails", "levelDetails"); // join with level details


    if (categoryId) {
      qb.andWhere("category.id = :categoryId", { categoryId: Number(categoryId) });
    }
    if (level) {
      qb.andWhere("levelDetails.level = :level", { level }); // 👈 filter by difficulty level
    }

    // Option A - getManyAndCount (simple and fine for many cases)
    // const [exercises, total] = await qb
    //   .orderBy("exercise.id", "DESC")
    //   .take(limit)
    //   .skip(skip)
    //   .getManyAndCount();

    // Option B - safer when joins might cause duplicate rows (use distinct count)
    const total = await qb.clone().select("exercise.id").distinct(true).getCount();
    const exercises = await qb
      .orderBy("exercise.id", "DESC")
      .take(limit)
      .skip(skip)
      .getMany();

    // return res.json(
    //   ResponseClass.paginated(
    //     exercises,
    //     total,
    //     page,
    //     limit,
    //     "Exercises fetched successfully",
    //     200
    //   )
    // );


   // return res.json(exercises)
    return res.json(
      ResponseClass.paginated({
        result: exercises,
        total,
        page,
        limit,
        message: "Exercises fetched successfully",
        statusCode: 200,
        name: "exercises", // 👈 key inside data
      })
    );
  } catch (err) {
   console.error("getAllExercises error:", err);
    return res
      .status(500)
      .json(
        ResponseClass.error({
          message: "getAllExercises error",
          statusCode: 500,
          name: "exercises",
        })
      );
  }
};



export const getExerciseById = async (req: Request, res: Response) => {
  try {
    const id = req.query.exerciseId;
    const level = req.query.level as string | undefined; // optional filter


    console.log(id)
    const query = exerciseRepo
      .createQueryBuilder("exercise")
      .leftJoinAndSelect("exercise.category", "category")
      .leftJoinAndSelect("exercise.levelDetails", "levelDetails")
      .where("exercise.id = :id", { id: Number(id) });

    // 👇 apply filter if level is provided
    if (level) {
      query.andWhere("levelDetails.level = :level", { level });
    }

    const exercise = await query.getOne(); // 👈 await here

    console.log(exercise)

    if (!exercise) {
          return res
      .status(500)
      .json(ResponseClass.error({
        message:"Exercise not found",
        statusCode:500,
        name:'getExerciseById'
      }));
      return res.status(404).json({ message: "Exercise not found" });
    }
    return res.json(ResponseClass.success({
  result: exercise,
  message: "Success",
  statusCode: 200,
  name: "getExerciseById"
}));
  } catch (error:any) {
    return res
      .status(500)
      .json(ResponseClass.error({
        message:error.message || "Internal Server Error",
        statusCode:error.statusCode,
        name:'getExerciseById'
      }));

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
