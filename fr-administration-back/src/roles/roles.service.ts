import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { UsersService } from '../users/users.service';
import { AssociationsService } from '../associations/associations.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => AssociationsService))
    private readonly associationsService: AssociationsService,
  ) {}

  /**
   * Create a roles
   * @param idAssociation the association id
   * @param idUser the user id
   * @param name the roles name
   * @returns the created roles
   * @throws NotFoundException if the user or the association is not found
   */
  async create({ idAssociation, idUser, name }: CreateRoleDto): Promise<Role> {
    // get the user and association
    const [user, association] = await Promise.all([
      this.usersService.findOne(idUser),
      this.associationsService.findOne(idAssociation),
    ]);
    if (!user || !association) {
      throw new NotFoundException('user or association not found');
    }

    // create the roles
    const role = new Role();
    role.name = name;
    role.user = user;
    role.association = association;
    return this.repository.save(role);
  }

  /**
   * Find all roles
   * @returns all roles
   */
  async findAll(): Promise<Role[]> {
    return this.repository.find();
  }

  /**
   * Find all roles by association
   * @param association the association id
   * @returns all roles
   */
  async findManyByAssociation(association: number): Promise<Role[]> {
    return this.repository.find({
      where: { associationId: association },
      relations: { association: true, user: true },
    });
  }

  /**
   * Find a roles by user and association
   * @param user the user id
   * @param association the association id
   * @returns the roles
   * @throws NotFoundException if the roles is not found
   */
  async findOne(user: number, association: number): Promise<Role> {
    const result = await this.repository.findOne({
      where: { userId: user, associationId: association },
    });
    if (result === null) {
      throw new NotFoundException('Role not found');
    }
    return result;
  }

  /**
   * Update a roles
   * @param user the user id
   * @param association the association id
   * @param updateRoleDto the update roles dto
   * @returns the updated roles
   * @throws NotFoundException if the roles is not found
   */
  async update(
    user: number,
    association: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    const role: Role = await this.findOne(user, association);
    role.name = updateRoleDto.name;
    return this.repository.save(role);
  }

  /**
   * Remove a roles
   * @param user the user id
   * @param association the association id
   * @returns the removed roles
   * @throws NotFoundException if the roles is not found
   */
  async remove(user: number, association: number): Promise<Role> {
    const role: Role = await this.findOne(user, association);
    return this.repository.remove(role);
  }

  /**
   * Get all roles by user
   * @param user the user id
   * @returns all roles
   */
  async getRolesForUser(user: number): Promise<Role[]> {
    return this.repository.find({ where: { userId: user } });
  }

  /**
   * Get all users by role name
   * @param name the role name
   * @returns all users
   */
  async getUsersByRoleName(name: string): Promise<User[]> {
    const roles = await this.repository.find({
      where: { name },
      relations: {
        user: true,
      },
    });
    return roles.map((role) => role.user);
  }

  async deleteMany(roles: Role[]): Promise<Role[]> {
    return this.repository.remove(roles);
  }
}
