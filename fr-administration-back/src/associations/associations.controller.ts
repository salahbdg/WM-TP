import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AssociationsService } from './associations.service';
import UpdateAssociation from './dto/updateAssociation.dto';
import CreateAssociation from './dto/createAssociation.dto';
import { UsersService } from '../users/users.service';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import AssociationDto from './dto/association.dto';
import Association from './entities/association.entity';
import { RolesService } from '../roles/roles.service';
import { AssociationMember } from './dto/association.member';
import { Minute } from '../minutes/entities/minute.entity';
import { MinutesService } from '../minutes/minutes.service';
import SortParamsDto from './dto/sortParams.dto';
import { Role } from '../roles/entities/role.entity';

// @UseGuards(AuthGuard('jwt'))
@ApiTags('associations')
@Controller('associations')
export class AssociationsController {
  constructor(
    private readonly associationsService: AssociationsService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => RolesService))
    private rolesService: RolesService,
    @Inject(forwardRef(() => MinutesService))
    private minutesService: MinutesService,
  ) {}

  @ApiOkResponse({
    description: 'All the associations.',
    type: [AssociationDto],
  })
  @Get()
  async getAssociations(): Promise<AssociationDto[]> {
    const associations: Association[] =
      await this.associationsService.getAssociations();
    const roles = await this.rolesService.findAll();
    const associationsDto: AssociationDto[] = associations.map(
      (association) => {
        return new AssociationDto().from(association, roles);
      },
    );
    return associationsDto;
  }

  @ApiOkResponse({ description: 'The association.', type: AssociationDto })
  @ApiNotFoundResponse({ description: 'Association not found.' })
  @Get(':id')
  async getOneAssociation(@Param('id') id: string): Promise<AssociationDto> {
    const idParsed = parseInt(id);
    const association = await this.associationsService.findOne(idParsed);
    const roles = await this.rolesService.findManyByAssociation(idParsed);
    return new AssociationDto().from(association, roles);
  }

  @ApiOkResponse({
    description: 'The association has been deleted.',
    type: Association,
  })
  @ApiNotFoundResponse({ description: 'Association not found.' })
  @Delete(':id')
  async deleteAssociation(@Param('id') id: string): Promise<Association> {
    return this.associationsService.deleteAssociation(+id);
  }

  @ApiOkResponse({
    description: 'The association has been updated.',
    type: AssociationDto,
  })
  @ApiNotFoundResponse({ description: 'Association not found.' })
  @Put(':id')
  async updateAssociation(
    @Param('id') id: string,
    @Body() data: UpdateAssociation,
  ): Promise<AssociationDto> {
    const idParsed = parseInt(id);
    const association = await this.associationsService.findOne(idParsed);
    if (association === undefined) {
      throw new NotFoundException('Association not found');
    }
    if (data.idUsers !== undefined) {
      const users = await this.usersService.findManyById(data.idUsers);
      association.users = users;
    }
    if (data.name !== undefined) {
      association.name = data.name;
    }
    const associationEdited = await this.associationsService.updateAssociation(
      idParsed,
      association,
    );
    // delete roles of deleted users
    if (data.idUsers !== undefined) {
      const roles = await this.rolesService.findManyByAssociation(idParsed);
      const rolesToDelete = roles.filter(
        (role) => !data.idUsers.includes(role.userId),
      );
      await this.rolesService.deleteMany(rolesToDelete);
    }
    const roles = await this.rolesService.findManyByAssociation(idParsed);
    return new AssociationDto().from(associationEdited, roles);
  }

  @ApiOkResponse({
    description: 'The members of the association.',
    type: [AssociationMember],
  })
  @ApiNotFoundResponse({ description: 'Association not found.' })
  @Get(':id/members')
  async getMembers(@Param('id') id: string): Promise<AssociationMember[]> {
    const idParsed = parseInt(id);
    const members = await this.associationsService.getMembers(idParsed);
    const roles = await this.rolesService.findManyByAssociation(idParsed);
    return members.map((member) => {
      const role = roles.find((role) => role.associationId === idParsed);
      return new AssociationMember().from(member, role);
    });
  }

  @ApiCreatedResponse({
    description: 'The association has been created.',
    type: AssociationDto,
  })
  @Post()
  async createAssociation(
    @Body() { name, idUsers }: CreateAssociation,
  ): Promise<AssociationDto> {
    const association = await this.associationsService.createAssociation(
      name,
      idUsers,
    );
    const roles = await this.rolesService.findManyByAssociation(association.id);
    return new AssociationDto().from(association, roles);
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({
    description: 'The minutes of the association.',
    type: [Minute],
  })
  @ApiNotFoundResponse({ description: 'Association not found.' })
  @Get(':id/minutes')
  async minutes(
    @Param('id') id: number,
    @Query() { order, sort }: SortParamsDto,
  ): Promise<Minute[]> {
    // check if association exists
    await this.associationsService.findOne(id);
    return this.minutesService.getMinutesForAssociation(id, sort, order);
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({ description: 'The roles of the association.', type: [Role] })
  @ApiNotFoundResponse({ description: 'Association not found.' })
  @Get(':id/roles')
  async roles(@Param('id') id: number): Promise<Role[]> {
    // check if association exists
    await this.associationsService.findOne(id);
    return this.rolesService.findManyByAssociation(id);
  }
}
