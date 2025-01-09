import { forwardRef, Module } from '@nestjs/common';
import { AssociationsService } from './associations.service';
import { UsersModule } from '../users/users.module';
import { AssociationsController } from './associations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Association from './entities/association.entity';
import { RolesModule } from '../roles/roles.module';
import { MinutesModule } from '../minutes/minutes.module';

@Module({
  controllers: [AssociationsController],
  providers: [AssociationsService],
  imports: [
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([Association]),
    forwardRef(() => RolesModule),
    forwardRef(() => MinutesModule),
  ],
  exports: [AssociationsService],
})
export class AssociationsModule {}
