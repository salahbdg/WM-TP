import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUser {
  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    type: String,
  })
  @IsNotEmpty()
  lastname: string;
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    type: String,
  })
  @IsNotEmpty()
  firstname: string;
  @ApiProperty({
    description: 'The age of the user',
    example: 42,
    type: Number,
    minimum: 0,
  })
  @IsNotEmpty()
  age: number;
  @ApiProperty({
    description: 'The password of the user',
    example: 'password',
    type: String,
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'user@mail.com',
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  constructor(data: Partial<CreateUser>) {
    Object.assign(this, data);
  }
}
