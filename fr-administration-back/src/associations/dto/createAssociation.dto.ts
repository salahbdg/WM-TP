import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export default class CreateAssociation {
  @ApiProperty({
    description: 'The name of the association',
    example: 'Association 1',
    type: String,
  })
  @IsNotEmpty()
  public name: string;
  @ApiProperty({
    description: 'The users ids of the association',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  public idUsers: number[];
}
