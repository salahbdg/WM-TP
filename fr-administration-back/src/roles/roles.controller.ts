import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly roleService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Get('users/:name')
  usersByRoleName(@Param('name') name: string) {
    return this.roleService.getUsersByRoleName(name);
  }

  @Get(':user/:association')
  findOne(
    @Param('user') user: string,
    @Param('association') association: string,
  ) {
    return this.roleService.findOne(+user, +association);
  }

  @Put(':user/:association')
  update(
    @Param('user') user: string,
    @Param('association') association: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.update(+user, +association, updateRoleDto);
  }

  @Delete(':user/:association')
  remove(
    @Param('user') user: string,
    @Param('association') association: string,
  ) {
    return this.roleService.remove(+user, +association);
  }
}
