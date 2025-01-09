import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import { ApiProperty } from '@nestjs/swagger';

export class AssociationMember {
  @ApiProperty({
    description: 'The last name of the association member',
    type: 'string',
    example: 'Smith',
  })
  public lastname: string;

  @ApiProperty({
    description: 'The first name of the association member',
    type: 'string',
    example: 'John',
  })
  public firstname: string;

  @ApiProperty({
    description: 'The age of the association member',
    type: 'number',
    example: 25,
  })
  public age: number;

  @ApiProperty({
    description: 'The role of the association member',
    type: 'string',
    example: 'President',
  })
  public role: string;

  @ApiProperty({
    description: 'The ID of the association member',
    type: 'number',
    example: 1,
  })
  public id: number;

  from(user: User, role: Role): AssociationMember {
    this.lastname = user.lastname;
    this.firstname = user.firstname;
    this.age = user.age;
    this.role = role ? role.name : 'member';
    this.id = user.id;
    return this;
  }
}
