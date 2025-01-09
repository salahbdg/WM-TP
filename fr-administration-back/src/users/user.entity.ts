import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

/**
 * The User entity represents the user data model for the application.
 */
@Entity()
export class User extends BaseEntity {
  /**
   * Auto-generated unique identifier for the user.
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Unique email address of the user.
   */
  @Column({ unique: true })
  email: string;

  /**
   * User's last name.
   */
  @Column()
  lastname: string;

  /**
   * User's first name.
   */
  @Column()
  firstname: string;

  /**
   * User's age.
   */
  @Column()
  age: number;

  /**
   * Encrypted password of the user (excluded from serialization).
   */
  @Column()
  @Exclude()
  password: string;

  /**
   * Indicates whether the user's email has been verified (excluded from serialization).
   */
  @Column()
  @Exclude()
  verified: boolean;

  /**
   * Unique token for email verification (excluded from serialization).
   */
  @Column({ unique: true })
  @Exclude()
  verificationToken: string;
}
