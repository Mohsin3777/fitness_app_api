import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany
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
import { Workout } from './Workout';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true, nullable: true })
  phone!: string;

  @Column({ unique: true,nullable: true })
  email!: string;

  @Column()
  password!: string;
  @Column({nullable: true})
  profileImage!: string;


  @Column({ nullable: true})
  age!: number;


    @Column('float')
  height!: number;

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


     // ✅ Define reverse relation (One user has many workouts)
  @OneToMany(() => Workout, (workout) => workout.user,)
  workouts: Workout[] | undefined;
    userExercises: any;


      @Column({ default: false})
  profileSetup!: boolean;


}
