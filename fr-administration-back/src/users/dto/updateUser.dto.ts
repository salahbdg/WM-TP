import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class UpdateUser {
  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    type: String,
    required: false,
  })
  lastname?: string;
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    type: String,
    required: false,
  })
  firstname?: string;
  @ApiProperty({
    description: 'The age of the user',
    example: 42,
    type: Number,
    required: false,
  })
  age?: number;
  @ApiProperty({
    description: 'The password of the user',
    example: 'password',
    type: String,
    required: false,
  })
  password?: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'user@mail.com',
    type: String,
    required: false,
  })
  @IsEmail()
  email?: string;
}
