import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AssociationsModule } from '../associations/associations.module';
import * as process from 'process';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    AssociationsModule,
    ClientsModule.register([
      {
        name: 'EVENT_NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'events',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
