import { Router } from 'express';
import { logExersice } from '../controllers/userExersice.controller';
import { AppDataSource } from '../ormconfig';

const router = Router();
router.post('/logExersice', logExersice);


export default router;