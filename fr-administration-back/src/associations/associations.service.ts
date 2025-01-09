import { Injectable, NotFoundException } from '@nestjs/common';
import Association from './entities/association.entity';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class AssociationsService {
  constructor(
    @InjectRepository(Association)
    private readonly repository: Repository<Association>,
    private readonly userService: UsersService,
  ) {}

  /**
   * Get all associations.
   */
  async getAssociations(): Promise<Association[]> {
    return this.repository.find();
  }

  /**
   * Delete an association by id.
   * @param id the association id
   * @returns the deleted association
   * @throws {NotFoundException} if the association is not found
   */
  async deleteAssociation(id: number): Promise<Association> {
    const association = await this.findOne(id);
    return this.repository.remove(association);
  }

  /**
   * Find one association by id.
   * @param id the association id
   * @returns the association
   * @throws {NotFoundException} if the association is not found
   */
  async findOne(id: number): Promise<Association> {
    const association = await this.repository.findOneBy({ id });
    if (!association) {
      throw new NotFoundException(`Association ${id} not found`);
    }
    return association;
  }

  /**
   * Update an association by id.
   * @param id the association id
   * @param association the data to update
   * @returns the updated association
   * @throws {NotFoundException} if the association is not found
   */
  async updateAssociation(
    id: number,
    association: Association,
  ): Promise<Association> {
    const associationToUpdate = await this.findOne(id);
    associationToUpdate.name = association.name;
    associationToUpdate.users = association.users;
    return this.repository.save(associationToUpdate);
  }

  /**
   * Get the users of an association.
   * @param id the association id
   * @returns the users of the association
   */
  async getMembers(id: number): Promise<User[]> {
    return this.repository
      .findOneBy({ id })
      .then((value) => value?.users ?? []);
  }

  /**
   * Create a new association.
   * @param name the name of the association
   * @param idUsers the users ids of the association
   * @returns the created association
   */
  async createAssociation(
    name: string,
    idUsers: number[],
  ): Promise<Association> {
    const users = await this.userService.findManyById(idUsers);
    const association = Association.create({ name, users });
    return this.repository.save(association);
  }

  /**
   * Get the associations of a user.
   * @param id the user id
   * @returns the associations of the user
   */
  async getAssociationsForUser(id: number): Promise<Association[]> {
    return this.repository.find({
      where: {
        users: {
          id,
        },
      },
    });
  }
}
