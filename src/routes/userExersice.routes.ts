import { Router } from 'express';
import { logExersice,getTodayExerscie } from '../controllers/userExersice.controller';
import { AppDataSource } from '../ormconfig';
import { protect } from "../middlewares/authMiddleware";

const router = Router();
router.post('/logExersice',protect, logExersice);
router.get('/getTodayExersice',protect, getTodayExerscie);


export default router;