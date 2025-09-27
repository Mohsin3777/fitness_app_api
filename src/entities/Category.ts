import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './User';
import { Exercise } from './Exercise';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;
    @Column({ nullable: true })
  image!: string;

  @OneToMany(() => User, (account) => account.category)
  accounts!: User[];

  @OneToMany(() => Exercise, (exercise) => exercise.category)
  exercises!: Exercise[];
}
