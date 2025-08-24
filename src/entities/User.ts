import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Category } from './Category';

export enum FitnessLevel {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
}

export enum YourGoal {
  WeightLoss = 'Weight loss',
  GainMuscle = 'Gain muscle',
  ImproveFitness = 'Improve fitness',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true, })
  phone!: string;

  @Column({ unique: true,nullable: true })
  email!: string;

  @Column()
  password!: string;
  @Column({nullable: true})
  profileImage!: string;


  @Column()
  age!: number;

  @Column('float')
  weight!: number;

  @Column('float')
  goalWeight!: number;

  @Column({ type: 'enum', enum: FitnessLevel })
  fitnessLevel!: FitnessLevel;

  @Column({ type: 'enum', enum: YourGoal })
  yourGoal!: YourGoal;

  @ManyToOne(() => Category, (category) => category.accounts)
  category!: Category;
}
