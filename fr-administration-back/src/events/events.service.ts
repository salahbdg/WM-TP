import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { AssociationsService } from '../associations/associations.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger('EventsService');

  constructor(
    @InjectRepository(Event) private readonly repository: Repository<Event>,
    @Inject('EVENT_NOTIFICATION_SERVICE') private client: ClientProxy,
    private readonly associationsService: AssociationsService,
  ) {}

  async create(createEventDto: CreateEventDto) {
    const { name, start, end, association } = createEventDto;
    const associationInDb = await this.associationsService.findOne(association);
    const event = Event.create({
      name,
      start,
      end,
      association: associationInDb,
    });
    return this.repository.save(event);
  }

  findAll() {
    return this.repository.find();
  }

  findAllfromAsso(id: number) {
    return this.repository.findBy({ association: { id: id } });
  }

  async findOne(id: number) {
    const event = await this.repository.findOne({ where: { id } });
    if (event === null) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    const { name, start, end, association } = updateEventDto;
    const event = await this.findOne(id);
    // merge the new data with the existing data
    // this will only update the values that have been provided
    const updatedEvent = Event.merge(event, {
      name,
      start,
      end,
      association: { id: association },
    });
    return this.repository.save(updatedEvent);
  }

  async remove(id: number) {
    const event = await this.findOne(id);
    return this.repository.remove(event);
  }

  async notify(event: Event) {
    this.logger.debug(`Sending event notification for ${event.name}`);
    const { name, start, end, association } = event;
    const payload = {
      name,
      start,
      end,
      associationName: association.name,
      attendeesEmails: association.users.map((user) => user.email),
    };
    await this.client
      .emit(
        'event_created',
        new RmqRecordBuilder(payload)
          .setOptions({ contentType: 'application/json' })
          .build(),
      )
      .toPromise();
  }
}
