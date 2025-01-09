import { User } from '../entities/user.entity';
import Association from '../../associations/entities/association.entity';

export default class UserWithAssociationsDto extends User {
  associations: Association[];

  public from(
    user: User,
    associations: Association[],
  ): UserWithAssociationsDto {
    this.id = user.id;
    this.firstname = user.firstname;
    this.lastname = user.lastname;
    this.age = user.age;
    this.associations = associations;
    this.email = user.email;
    return this;
  }
}
