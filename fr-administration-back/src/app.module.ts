import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AssociationsModule } from './associations/associations.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import Association from './associations/entities/association.entity';
import { Role } from './roles/entities/role.entity';
import { MinutesModule } from './minutes/minutes.module';
import { Minute } from './minutes/entities/minute.entity';
import { EventsModule } from './events/events.module';
import { Event } from './events/entities/event.entity';
import { VerificationModule } from './verification/verification.module';

@Module({
  imports: [
    UsersModule,
    AssociationsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: 5432,
      entities: [User, Association, Role, Minute, Event],
      synchronize: true,
    }),
    AuthModule,
    RolesModule,
    MinutesModule,
    EventsModule,
    VerificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
