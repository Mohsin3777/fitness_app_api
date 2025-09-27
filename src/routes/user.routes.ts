import { Router } from 'express';
import { createUser,getUser,login,updateUser } from '../controllers/user.controller';
import { AppDataSource } from '../ormconfig';
import { protect } from "../middlewares/authMiddleware";

const router = Router();
router.post('/createUser', createUser); // POST /users
router.post('/login', login); // POST /users

router.get('/', getUser); // POST /users

router.patch('/updateUser',protect, updateUser); // POST /users


export default router;