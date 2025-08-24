// src/routes/category.routes.ts
import { Router } from 'express';
import { createCategory, getAllCategories } from '../controllers/category.controller';

const router = Router();

router.post('/', createCategory);     // Create category
router.get('/', getAllCategories);    // Get all categories

export default router;
