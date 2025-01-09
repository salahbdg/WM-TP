import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumberString } from 'class-validator';

export class CreateMinuteDto {
  @ApiProperty({
    description:
      'The content of the minute, should relate the accepted motions',
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum et sagittis sem. Praesent sollicitudin lacus.',
    type: String,
  })
  @IsNotEmpty()
  public content: string;

  @ApiProperty({
    description:
      'The ids of the voters. These should be the same than the users that are members of the association',
    example: [1, 2, 3],
    type: [Number],
  })
  public idVoters: number[];

  @ApiProperty({
    description: 'The date when the general assembly occured',
    example: '12/12/2021',
    type: String,
  })
  @IsNotEmpty()
  @IsDateString()
  public date: string;

  @ApiProperty({
    description: 'The id of the association',
    example: '1',
    type: Number,
  })
  @IsNumberString()
  @IsNotEmpty()
  public idAssociation: number;
}
