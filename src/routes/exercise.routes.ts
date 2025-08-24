// src/routes/exercise.routes.ts
import { Router } from 'express';
import { createExercise, getAllExercises ,getExerciseById} from '../controllers/exercise.controller';

const router = Router();

router.post('/', createExercise);      // Create exercise
router.get('/', getAllExercises);      // Get all exercises
router.get('/getExersiceById', getExerciseById);      // Get all exercises


export default router;
