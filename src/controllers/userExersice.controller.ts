import { AppDataSource } from '../ormconfig';
import { UserExercise } from '../entities/UserExersice';
import { User } from '../entities/User';
import { Exercise } from '../entities/Exercise';
import { Request, Response } from 'express';
import { ResponseClass } from '../utils/response';

const userExerciseRepo = AppDataSource.getRepository(UserExercise);

export const logExersice =async  (req: Request, res: Response )=> {

try {
        const { userId, exerciseId  } = req.body;


  const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
  const exercise = await AppDataSource.getRepository(Exercise).findOneBy({ id: exerciseId });

  if (!user || !exercise) {
    throw new Error("User or Exercise not found");
  }

  const log = userExerciseRepo.create({
    user,
    exercise,
    sets: 3,
    reps: 12,
    weight: 50,
    notes: "Felt good today!",
  });

var data=  await userExerciseRepo.save(log);
  console.log("Exercise logged:", log);

    return res.json(ResponseClass.success(data, "Exercise logged successfully", 201,));

} catch (error:any) {
        console.error("Create Workout Error:", error);
 return res
      .status(500)
      .json(ResponseClass.error(error.message || "Internal Server Error"));}
}
