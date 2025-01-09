import { forwardRef, Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { UsersModule } from '../users/users.module';
import { AssociationsModule } from '../associations/associations.module';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [
    TypeOrmModule.forFeature([Role]),
    forwardRef(() => AssociationsModule),
    forwardRef(() => UsersModule),
  ],
  exports: [RolesService],
})
export class RolesModule {}
