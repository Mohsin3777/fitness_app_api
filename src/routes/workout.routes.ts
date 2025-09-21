import { Router } from 'express';
import { createWorkout,getUserWorkouts,updateWorkout,deleteWorkout ,getUserProgress} from '../controllers/workout.controller';

const router = Router();

router.post('/', createWorkout);     // Create workout
router.get('/', getUserWorkouts);    // Get all user workout
router.patch('/update', updateWorkout);    // update user workout
router.delete('/delete', deleteWorkout);    // update user workout

router.get('/workoutProgress', getUserProgress);    // update user workout

export default router;