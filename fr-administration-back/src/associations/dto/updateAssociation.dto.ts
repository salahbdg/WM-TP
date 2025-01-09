import { ApiProperty } from '@nestjs/swagger';

export default class UpdateAssociation {
  @ApiProperty({
    description: 'The users ids of the association',
    example: [1, 2, 3],
    type: [Number],
    required: false,
  })
  idUsers?: number[];
  @ApiProperty({
    description: 'The name of the association',
    example: 'Association 1',
    type: String,
    required: false,
  })
  name?: string;
}
