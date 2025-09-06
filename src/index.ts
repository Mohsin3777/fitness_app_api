import dotenv from 'dotenv';
// Load .env variables
dotenv.config();

dotenv.config({ path: __dirname + '/../.env' });

import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './ormconfig';

// Import routes (create these later)
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import exerciseRoutes from './routes/exercise.routes';



// Create Express app
const app = express();
app.use(express.json());

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/exercises', exerciseRoutes);

// Start server after DB connection
AppDataSource.initialize()
  .then(() => {
    console.log('✅ MySQL Database connected');

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error: any) => {
    console.error('❌ Error connecting to the database:', error);
  });
