import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Exercise } from './Exercise';
import { ExerciseLevelDetail } from './ExerciseLevelDetail';

@Entity()
export class UserExercise {
  @PrimaryGeneratedColumn()
  id!: number;

  // ✅ Relationship with User
  @ManyToOne(() => User, (user) => user.userExercises, { onDelete: 'CASCADE' })
  user!: User;

  // ✅ Relationship with Exercise
  @ManyToOne(() => Exercise, (exercise) => exercise.userExercises, { onDelete: 'CASCADE' })
  exercise!: Exercise;

  // ✅ Workout details
  @Column('int')
  sets!: number;

  @Column('int')
  reps!: number;

  @Column('float')
  weight!: number; // e.g., kg or lbs

  @Column({ nullable: true })
  notes!: string;

  // ✅ Date of exercise
  @CreateDateColumn()
  performedAt!: Date;

  @ManyToOne(() => ExerciseLevelDetail, { nullable: true })
levelDetail?: ExerciseLevelDetail;

  @Column('float')
  caloriesBurned!: number; // e.g., kg or lbs
}
