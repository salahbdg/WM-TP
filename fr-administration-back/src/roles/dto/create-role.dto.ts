import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description:
      'The name of the roles of the given user in the given association',
    example: 'President',
    type: String,
  })
  @IsNotEmpty()
  public name: string;

  @ApiProperty({
    description: 'The id of the user',
    example: '1',
    type: Number,
  })
  @IsNotEmpty()
  public idUser: number;

  @ApiProperty({
    description: 'The id of the association',
    example: '1',
    type: Number,
  })
  @IsNotEmpty()
  public idAssociation: number;
}
