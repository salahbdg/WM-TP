import { AssociationMember } from './association.member';
import Association from '../entities/association.entity';
import { Role } from '../../roles/entities/role.entity';
import { ApiProperty } from '@nestjs/swagger';

export default class AssociationDto {
  @ApiProperty({
    description: 'The ID of the association',
    type: 'number',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The name of the association',
    type: 'string',
    example: 'Smith Family Association',
  })
  public name: string;

  @ApiProperty({
    description: 'The members of the association',
    type: 'array',
    example: [
      {
        lastname: 'Smith',
        firstname: 'John',
        age: 25,
        role: 'President',
        id: 1,
      },
      {
        lastname: 'Doe',
        firstname: 'Jane',
        age: 24,
        role: 'Secretary',
        id: 2,
      },
    ],
  })
  public members: AssociationMember[];

  public from(association: Association, roles: Role[]): AssociationDto {
    this.name = association.name;
    this.id = association.id;
    this.members = association.users.map((userInfo) => {
      const role = roles.find(
        (value) =>
          value.userId === userInfo.id &&
          value.associationId === association.id,
      );
      return new AssociationMember().from(userInfo, role);
    });
    return this;
  }
}
