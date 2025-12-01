import { AppDataSource } from '../ormconfig';
import { UserExercise } from '../entities/UserExersice';
import { User } from '../entities/User';
import { Exercise } from '../entities/Exercise';
import { Request, Response } from 'express';
import { ResponseClass } from '../utils/response';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Between } from 'typeorm';

const userExerciseRepo = AppDataSource.getRepository(UserExercise);
const exersiceRepo = AppDataSource.getRepository(Exercise);

export const logExersice =async  (req: Request, res: Response )=> {

try {
        const {  exersiceId ,level,duration } = req.body;

const userId=(req as AuthRequest).user!.id;

  const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
 // const exercise = await AppDataSource.getRepository(Exercise).findOneBy({ id: exerciseId });

    const query = exersiceRepo
      .createQueryBuilder("exercise")
    .leftJoinAndSelect("exercise.category", "category")
      .leftJoinAndSelect("exercise.levelDetails", "levelDetails")
      .where("exercise.id = :id", { id: Number(exersiceId) });

    // 👇 apply filter if level is provided
    if (level) {
      query.andWhere("levelDetails.level = :level", { level });
    }

    
  
    const exercise = await query.getOne(); // 👈 await here

if (!user || !exercise) {
    throw new Error("User or Exercise not found");
  }
const levelDetail = exercise?.levelDetails?.find(ld => ld.level === level);
  



// set MET values based on level or type
let MET = 5; // default moderate
if (level === "beginner") MET = 3.5;
else if (level === "advanced") MET = 8;

// calories formula
const caloriesBurned = (MET * 3.5 * (user.weight || 70) / 200) * duration;

  const log = userExerciseRepo.create({
    user,
    exercise,
    sets: 3,
    reps: 12,
    weight: 50,
    notes: "Felt good today!",
    levelDetail:levelDetail,
     caloriesBurned:caloriesBurned

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

export const getTodayExerscie = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user!.id;

    const rawLimit = parseInt((req.query.limit as string) || "10", 10);
    const rawPage = parseInt((req.query.page as string) || "1", 10);

    const limit = Math.min(Math.max(1, Number.isNaN(rawLimit) ? 10 : rawLimit), 100); // cap 100
    const page = Math.max(1, Number.isNaN(rawPage) ? 1 : rawPage);
    const skip = (page - 1) * limit;

    const query = userExerciseRepo
      .createQueryBuilder("user_exercise")
      .leftJoinAndSelect("user_exercise.user", "user")
      .leftJoinAndSelect("user_exercise.exercise", "exercise")
      .leftJoinAndSelect("user_exercise.levelDetail", "levelDetail")
      .where("user_exercise.userId = :userId", { userId }) // filter by current user
      .orderBy("user_exercise.performedAt", "DESC");

    const total = await query.clone().select("user_exercise.id").getCount();

    const result = await query.take(limit).skip(skip).getMany();

    // 🧠 Transform result — put levelDetail inside exercise as "level"
    const formatted = result.map((item) => ({
      ...item,
      exercise: {
        ...item.exercise,
        levelDetail: item.levelDetail
          ? [{
              id: item.levelDetail.id,
              name: item.levelDetail.level,
              set:item.levelDetail.sets,
              durationMinutes:item.levelDetail.durationMinutes
            //  description: item.levelDetail.description || null,
            }]
          : [],
      },
    }));

    return res.json(
      ResponseClass.paginated({
        result: formatted,
        total,
        page,
        limit,
        message: "Exercises fetched successfully",
        statusCode: 200,
        name: "getTodayExerscie",
      })
    );
  } catch (error: any) {
    console.error("getTodayExerscie Error:", error);
    return res
      .status(500)
      .json(
        ResponseClass.error({
          message: error.message || "Internal Server Error",
          statusCode: error.statusCode,
          name: "getTodayExerscie",
        })
      );
  }
};





export const getTodayExerciseStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user!.id;

    // 🕒 Define today's start and end
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 🧮 Fetch user's exercise records for today
    const exercises = await userExerciseRepo.find({
      where: {
        user: { id: userId },
        performedAt: Between(startOfDay, endOfDay),
      },
      relations: ["exercise", "levelDetail"],
    });

    // If no exercise today
    if (!exercises.length) {
      return res.json(
        ResponseClass.success({
          result: {
            totalExercises: 0,
            totalSets: 0,
            totalReps: 0,
            totalDuration: 0,
            totalCalories: 0,
          },
          message: "No exercises performed today",
          statusCode: 200,
          name: "getTodayExerciseStats",
        })
      );
    }

    // ✅ Aggregate stats
    let totalSets = 0;
    let totalReps = 0;
    let totalDuration = 0;
    let totalCalories = 0;

    for (const ex of exercises) {
      totalSets += ex.sets;
      totalReps += ex.reps;

      // Get duration from level detail if available
      const duration = ex.levelDetail?.durationMinutes || 0;
      totalDuration += duration;

      // 🔥 Basic calorie formula (customize later)
      // e.g., 8 kcal per minute (approx moderate intensity)
      totalCalories += duration * 8;
    }

    return res.json(
      ResponseClass.success({
        result: {
          totalExercises: exercises.length,
          totalSets,
          totalReps,
          totalDuration,
          totalCalories: Math.round(totalCalories),
        },
        message: "Today's exercise stats fetched successfully",
        statusCode: 200,
        name: "getTodayExerciseStats",
      })
    );
  } catch (error: any) {
    console.error("getTodayExerciseStats Error:", error);
    return res.status(500).json(
      ResponseClass.error({
        message: error.message || "Internal Server Error",
        statusCode: 500,
        name: "getTodayExerciseStats",
      })
    );
  }
};




export const getExerciseCalendar = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user!.id;

    // 🗓️ Year filter (default: current year)
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const startOfYear = new Date(`${year}-01-01T00:00:00`);
    const endOfYear = new Date(`${year}-12-31T23:59:59`);

    // 🧮 Fetch exercises with level details for duration
    const exercises = await userExerciseRepo.find({
      where: {
        user: { id: userId },
        performedAt: Between(startOfYear, endOfYear),
      },
      relations: ["levelDetail"],
    });

    // Group by date
    const dateMap = new Map<
      string,
      { id: number; totalExercises: number; totalDuration: number; totalCalories: number }
    >();

    exercises.forEach((ex) => {
      const dateKey = ex.performedAt.toISOString().split("T")[0]; // YYYY-MM-DD

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          id: ex.id,
          totalExercises: 0,
          totalDuration: 0,
          totalCalories: 0,
        });
      }

      const data = dateMap.get(dateKey)!;
      data.totalExercises += 1;

      const duration = ex.levelDetail?.durationMinutes || 0;
      data.totalDuration += duration;
      data.totalCalories += duration * 8; // 8 kcal/min approx
    });

    const result = Array.from(dateMap.entries()).map(([date, data]) => ({
      id: data.id,
      date,
      totalExercises: data.totalExercises,
      totalDuration: data.totalDuration,
      totalCalories: Math.round(data.totalCalories),
    }));

    return res.json(
      ResponseClass.success({
        result: {
          year,
          dates: result,
        },
        message: "Exercise calendar fetched successfully",
        statusCode: 200,
        name: "getExerciseCalendar",
      })
    );
  } catch (error: any) {
    console.error("getExerciseCalendar Error:", error);
    return res.status(500).json(
      ResponseClass.error({
        message: error.message || "Internal Server Error",
        statusCode: 500,
        name: "getExerciseCalendar",
      })
    );
  }
};