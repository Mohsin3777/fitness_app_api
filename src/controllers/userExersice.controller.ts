import { AppDataSource } from '../ormconfig';
import { UserExercise } from '../entities/UserExersice';
import { User } from '../entities/User';
import { Exercise } from '../entities/Exercise';
import { Request, Response } from 'express';
import { ResponseClass } from '../utils/response';
import { AuthRequest } from '../middlewares/authMiddleware';

const userExerciseRepo = AppDataSource.getRepository(UserExercise);

export const logExersice =async  (req: Request, res: Response )=> {

try {
        const {  exerciseId  } = req.body;

const userId=(req as AuthRequest).user!.id;

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

  return res.json(ResponseClass.success(
    {
      result:data,
      message:"Success",
      statusCode:201,
      name:'logExersice'
    }
  ));

} catch (error:any) {
        console.error("Create Workout Error:", error);
 return res
      .status(500)
      .json(ResponseClass.error({
        message:error.message || "Internal Server Error",
        statusCode:error.statusCode,
        name:'logExersice'
      }));}
}


export const getTodayExerscie =async  (req: Request, res: Response )=> {

try {
const userId=(req as AuthRequest).user!.id;


    const rawLimit = parseInt((req.query.limit as string) || "10", 10);
    const rawPage = parseInt((req.query.page as string) || "1", 10);

    const limit = Math.min(Math.max(1, Number.isNaN(rawLimit) ? 10 : rawLimit), 100); // cap 100
    const page = Math.max(1, Number.isNaN(rawPage) ? 1 : rawPage);
    const skip = (page - 1) * limit;

const query = userExerciseRepo
  .createQueryBuilder("user_exercise")
  .leftJoinAndSelect("user_exercise.user", "user")
  .leftJoinAndSelect("user_exercise.exercise", "exercise")
    .orderBy("user_exercise.performedAt", "DESC")

    .select([
     "user_exercise.id",
    "user_exercise.sets",
    "user_exercise.reps",
    "user_exercise.weight",
    "user_exercise.performedAt",
    "exercise.id",
    "exercise.name",
    'exercise.image',
    "user.id",
    "user.firstName",
   "user.profileImage",
  ])

    const total = await query.clone().select("exercise.id").distinct(true).getCount();

const result = await query
    .orderBy("exercise.id", "DESC")
      .take(limit)
      .skip(skip)
.getMany();
 // console.log(result)

  
  //     const exercise = await query.getOne(); // 👈 await here
  // console.log(exercise)
  //     if (!exercise) {
  //       return res.status(404).json({ message: "Exercise not found" });
  //     }

  //return res.status(200).json({ message: result });

   return res.json(
      ResponseClass.paginated({
        result: result,
        total,
        page,
        limit,
        message: "Exercises fetched successfully",
        statusCode: 200,
        name: "getTodayExerscie", // 👈 key inside data
      })
    );
 


  
} catch (error:any) {
   console.error("getTodayExerscie Error:", error);
 return res
      .status(500)
      .json(ResponseClass.error({
        message:error.message || "Internal Server Error",
        statusCode:error.statusCode,
        name:'getTodayExerscie'
      }));}
}
