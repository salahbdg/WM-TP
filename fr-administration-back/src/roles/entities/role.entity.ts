import { User } from '../../users/entities/user.entity';
import Association from '../../associations/entities/association.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Role {
  @Column()
  name: string;

  @OneToOne(() => User, { createForeignKeyConstraints: false }) // don't put the foreign key in the association table
  @JoinColumn({ name: 'userId' })
  user: User;

  @PrimaryColumn({ unique: false })
  userId: number;

  @PrimaryColumn({ unique: false })
  associationId: number;

  @OneToOne(() => Association, { createForeignKeyConstraints: false }) // don't put the foreign key in the association table
  @JoinColumn({ name: 'associationId' })
  association: Association;
}
