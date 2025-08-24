import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { User } from './User';

import { Category } from './Category';
import { WorkoutExercise } from './WorkoutExercis';

@Entity()
export class Workout {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.workouts, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  date!: Date;

  @Column({ nullable: true })
  notes!: string;

  @OneToMany(() => WorkoutExercise, (we) => we.workout, { cascade: true })
  exercises!: WorkoutExercise[];
}
