// src/routes/exercise.routes.ts
import { Router } from 'express';
import { createExercise, getAllExercises ,getExerciseById,getExercisesByLevel,updateExercise} from '../controllers/exercise.controller';
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post('/', createExercise);      // Create exercise
router.get('/',protect, getAllExercises);      // Get all exercises
router.get('/getExersiceById', protect,getExerciseById);      // Get all exercises

router.get('/getExercisesByLevel',protect, getExercisesByLevel);      // Get all exercises
router.patch('/updateExersice', updateExercise);      // Get all exercises

export default router;
