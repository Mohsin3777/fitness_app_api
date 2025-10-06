import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Category } from './entities/Category';
import { Exercise } from './entities/Exercise';
import { ExerciseLevelDetail } from './entities/ExerciseLevelDetail';

import { WorkoutExercise } from './entities/WorkoutExercis';
import { Workout } from './entities/Workout';
import { UserExercise } from './entities/UserExersice';


export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: 3306,
  username: 'root',
//  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User, Category, Exercise,ExerciseLevelDetail,WorkoutExercise,Workout, UserExercise
  ],
});
