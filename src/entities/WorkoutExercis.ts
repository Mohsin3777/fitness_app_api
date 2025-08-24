import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { User } from './User';

import { Workout } from './Workout';
import { Exercise } from './Exercise';


@Entity()
export class WorkoutExercise {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Workout, (workout) => workout.exercises, { onDelete: 'CASCADE' })
  workout!: Workout;

  @ManyToOne(() => Exercise, { eager: true })
  exercise!: Exercise;

  @Column()
  sets!: number;

  @Column()
  reps!: number;

  @Column('float', { nullable: true })
  weight!: number; // if applicable

  @Column('float', { nullable: true })
  duration!: number; // in seconds or minutes
}
