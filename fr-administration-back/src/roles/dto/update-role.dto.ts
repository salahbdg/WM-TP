import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    description:
      'The new name of the roles of the given user in the given association',
    example: 'President',
    type: String,
  })
  @IsNotEmpty()
  public name: string;
}
