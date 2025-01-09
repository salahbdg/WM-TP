import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Association from '../../associations/entities/association.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Minute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column()
  date: Date;

  @ManyToOne(() => Association, { eager: true })
  @JoinTable()
  association: Association;

  @ManyToMany(() => User, { eager: true })
  @JoinTable()
  voters: User[];
}
