import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMinuteDto } from './dto/create-minute.dto';
import { UpdateMinuteDto } from './dto/update-minute.dto';
import { Repository } from 'typeorm';
import { Minute } from './entities/minute.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AssociationsService } from '../associations/associations.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class MinutesService {
  constructor(
    @InjectRepository(Minute) private readonly repository: Repository<Minute>,
    @Inject(forwardRef(() => AssociationsService))
    private readonly associationsService: AssociationsService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  /**
   * Create a new minute.
   * @param createMinuteDto the minute to create
   * @returns the created minute
   * @throws {NotFoundException} if the association or the users does not exist
   */
  async create(createMinuteDto: CreateMinuteDto): Promise<Minute> {
    const [association, users] = await Promise.all([
      this.associationsService.findOne(createMinuteDto.idAssociation),
      this.usersService.findManyById(createMinuteDto.idVoters),
    ]);
    if (association === null) {
      throw new NotFoundException('Association not found');
    }
    if (users.length !== createMinuteDto.idVoters.length) {
      throw new NotFoundException('Some users not found');
    }

    const minute = new Minute();
    minute.content = createMinuteDto.content;
    minute.date = new Date(createMinuteDto.date);
    minute.association = association;
    minute.voters = users;
    return this.repository.save(minute);
  }

  /**
   * Find all minutes.
   * @returns all minutes
   */
  findAll(): Promise<Minute[]> {
    return this.repository.find();
  }

  /**
   * Find one minute by its id.
   * @param id the id of the minute
   * @returns the minute
   * @throws {NotFoundException} if the minute does not exist
   */
  async findOne(id: number): Promise<Minute | null> {
    const minute = await this.repository.findOne({ where: { id } });
    if (minute === null) {
      throw new NotFoundException('Minute not found');
    }
    return minute;
  }

  /**
   * Update a minute.
   * @param id the id of the minute to update
   * @param updateMinuteDto the new minute
   * @returns the updated minute
   * @throws {NotFoundException} if the minute or the association or the users does not exist
   */
  async update(id: number, updateMinuteDto: UpdateMinuteDto): Promise<Minute> {
    // search the minute
    const minute = await this.findOne(id);

    // edit the minute
    if (updateMinuteDto.content !== undefined) {
      minute.content = updateMinuteDto.content;
    }
    if (updateMinuteDto.date !== undefined) {
      minute.date = new Date(updateMinuteDto.date);
    }
    if (updateMinuteDto.idAssociation !== undefined) {
      const association = await this.associationsService.findOne(
        updateMinuteDto.idAssociation,
      );
      if (association === null) {
        throw new NotFoundException('Association not found');
      }
      minute.association = association;
    }
    if (updateMinuteDto.idVoters !== undefined) {
      const users = await this.usersService.findManyById(
        updateMinuteDto.idVoters,
      );
      if (users.length !== updateMinuteDto.idVoters.length) {
        throw new NotFoundException('Some users not found');
      }
      minute.voters = users;
    }
    // save the minute
    return this.repository.save(minute);
  }

  /**
   * Delete a minute.
   * @param id the id of the minute to delete
   * @throws {NotFoundException} if the minute does not exist
   * @returns the deleted minute
   */
  async remove(id: number): Promise<Minute> {
    const minute = await this.findOne(id);
    return this.repository.remove(minute);
  }

  /**
   * Find all minutes of an association.
   * @param id the id of the association
   * @param sort the sort to apply
   * @param order the order to apply
   */
  async getMinutesForAssociation(
    id: number,
    sort = 'date',
    order = 'DESC',
  ): Promise<Minute[]> {
    const sortParams = {};
    sortParams[sort] = order;
    return this.repository.find({
      where: { association: { id } },
      order: sortParams,
    });
  }
}
