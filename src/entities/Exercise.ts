import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Category } from './Category';
import { ExerciseLevelDetail } from './ExerciseLevelDetail';

@Entity()
export class Exercise {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column('text')
  description!: string;

  @ManyToOne(() => Category, (category) => category.exercises)
  category!: Category;

  @Column({ nullable: true })
  equipment!: string;

  @Column({ nullable: true })
  videoUrl!: string;

  @OneToMany(() => ExerciseLevelDetail, (detail) => detail.exercise, {
    cascade: true,
  })
  levelDetails!: ExerciseLevelDetail[];
}
