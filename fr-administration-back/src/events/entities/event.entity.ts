import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Association from '../../associations/entities/association.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Event extends BaseEntity {
  @ApiProperty({
    type: Number,
    description: 'The id of the event',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: String,
    description: 'The name of the event',
    example: 'Birthday party',
  })
  @Column()
  name: string;

  @ApiProperty({
    type: Date,
    description: 'The start of the event',
    example: new Date('2021-01-01T00:00:00.000Z'),
  })
  @Column()
  start: Date;

  @ApiProperty({
    type: Date,
    description: 'The end of the event',
    example: new Date('2021-01-01T00:00:00.000Z'),
  })
  @Column()
  end: Date;

  @ApiProperty({
    type: Association,
    description: 'The association of the event',
  })
  @ManyToOne(() => Association, (association) => association.id, {
    eager: true,
  })
  association: Association;
}
