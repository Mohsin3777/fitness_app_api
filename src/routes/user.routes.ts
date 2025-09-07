import { Router } from 'express';
import { createUser,getUser,login,updateUser } from '../controllers/user.controller';
import { AppDataSource } from '../ormconfig';

const router = Router();
router.post('/createUser', createUser); // POST /users
router.post('/login', login); // POST /users

router.get('/', getUser); // POST /users

router.patch('/updateUser', updateUser); // POST /users


export default router;