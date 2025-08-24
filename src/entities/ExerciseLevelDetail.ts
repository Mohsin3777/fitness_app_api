import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Exercise } from './Exercise';
import { DifficultyLevel } from '../utils/enum';

@Entity()
@Unique(['exercise', 'level']) // Prevent duplicate level per exercise
export class ExerciseLevelDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.levelDetails, {
    onDelete: 'CASCADE',
  })
  exercise!: Exercise;

  @Column({ type: 'enum', enum: DifficultyLevel })
  level!: DifficultyLevel;

  @Column({ nullable: true })
  sets!: number;

  @Column({ nullable: true })
  reps!: number;

  @Column({ nullable: true }) // in minutes or seconds
  durationMinutes!: number;
}
