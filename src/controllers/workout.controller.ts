import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { User } from '../entities/User';
import { Workout } from '../entities/Workout';
import { WorkoutExercise } from '../entities/WorkoutExercis';

export const createWorkout = async (req: Request, res: Response) => {
  try {
    const { userId, date, notes, exercises } = req.body;

    if (!userId || !date || !Array.isArray(exercises)) {
      return res.status(400).json({ message: "userId, date, and exercises are required" });
    }

    const userRepo = AppDataSource.getRepository(User);
    const workoutRepo = AppDataSource.getRepository(Workout);
    const workoutExerciseRepo = AppDataSource.getRepository(WorkoutExercise);

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const workout = workoutRepo.create({
      user,
      date,
      notes,
    });

    const savedWorkout = await workoutRepo.save(workout);

    // Add exercises
    const workoutExercises = exercises.map((ex: any) =>
      workoutExerciseRepo.create({
        workout: savedWorkout,
        exercise: { id: ex.exerciseId }, // only pass ID
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight ?? null,
        duration: ex.duration ?? null,
      })
    );

    await workoutExerciseRepo.save(workoutExercises);

    const finalWorkout = await workoutRepo.findOne({
      where: { id: savedWorkout.id },
      relations: ["exercises", "exercises.exercise"],
    });

    return res.status(201).json({ message: "Workout created", data: finalWorkout });
  } catch (err) {
    console.error("Create Workout Error:", err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};

//2. Get All Workouts of a User

export const getUserWorkouts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    const workoutRepo = AppDataSource.getRepository(Workout);

    const workouts = await workoutRepo.find({
      where: { user: { id: Number(userId) } },
      relations: ["exercises", "exercises.exercise"],
      order: { date: "DESC" },
    });

    return res.status(200).json({ message: "Success", data: workouts });
  } catch (err) {
    console.error("Get Workouts Error:", err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};


//Update Workout (change notes or exercises)
export const updateWorkout = async (req: Request, res: Response) => {
  try {
    const { id } = req.query; // workout id
    const { notes, exercises } = req.body;

    const workoutRepo = AppDataSource.getRepository(Workout);
    const workoutExerciseRepo = AppDataSource.getRepository(WorkoutExercise);

    const workout = await workoutRepo.findOne({
      where: { id: Number(id) },
      relations: ["exercises"],
    });

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    if (notes) workout.notes = notes;

    if (Array.isArray(exercises)) {
      // Remove old exercises and add new ones
      await workoutExerciseRepo.remove(workout.exercises);

      const newExercises = exercises.map((ex: any) =>
        workoutExerciseRepo.create({
          workout,
          exercise: { id: ex.exerciseId },
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight ?? null,
          duration: ex.duration ?? null,
        })
      );

      await workoutExerciseRepo.save(newExercises);
    }

    const updatedWorkout = await workoutRepo.findOne({
      where: { id: workout.id },
      relations: ["exercises", "exercises.exercise"],
    });

    return res.status(200).json({ message: "Workout updated", data: updatedWorkout });
  } catch (err) {
    console.error("Update Workout Error:", err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};


//Delete Workout
export const deleteWorkout = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;

    const workoutRepo = AppDataSource.getRepository(Workout);
    const workout = await workoutRepo.findOne({ where: { id: Number(id) } });

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    await workoutRepo.remove(workout);

    return res.status(200).json({ message: "Workout deleted" });
  } catch (err) {
    console.error("Delete Workout Error:", err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};
