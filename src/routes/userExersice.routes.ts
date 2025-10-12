import { Router } from 'express';
import { logExersice,getTodayExerscie, getTodayExerciseStats,getExerciseCalendar } from '../controllers/userExersice.controller';
import { AppDataSource } from '../ormconfig';
import { protect } from "../middlewares/authMiddleware";

const router = Router();
router.post('/logExersice',protect, logExersice);
router.get('/getTodayExersice',protect, getTodayExerscie);
router.get('/getTodayExerciseStats',protect, getTodayExerciseStats );

router.get('/getExerciseCalendar',protect, getExerciseCalendar );

export default router;