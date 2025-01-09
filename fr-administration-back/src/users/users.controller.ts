import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { User } from './user.entity';
import { CreateUser } from './dto/createUser.dto';
import { UpdateUser } from './dto/updateUser.dto';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../roles/entities/role.entity';
import { RolesService } from '../roles/roles.service';
import { AssociationsService } from '../associations/associations.service';
import UserWithAssociationsDto from './dto/userWithAssociations.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => RolesService))
    private readonly rolesService: RolesService,
    @Inject(forwardRef(() => AssociationsService))
    private readonly associationsService: AssociationsService,
  ) {}

  /**
   * Retrieve all users.
   */
  @ApiOkResponse({ description: 'All the users.' })
  @Get()
  async getAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  /**
   * Retrieve a single user by ID along with their associations.
   */
  @ApiOkResponse({ description: 'The user.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @Get(':id')
  async getOneUser(@Param('id') id: string): Promise<UserWithAssociationsDto> {
    const userId = parseInt(id);
    const user = await this.usersService.findOne(userId);
    const associations = await this.associationsService.getAssociationsForUser(userId);

    return new UserWithAssociationsDto().from(user, associations);
  }

  /**
   * Retrieve roles associated with a specific user.
   */
  @ApiOkResponse({ description: 'The user roles.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @Get(':id/roles')
  async getRoles(@Param('id') id: string): Promise<Role[]> {
    const userId = parseInt(id);
    await this.usersService.findOne(userId); // Ensure the user exists
    return this.rolesService.getRolesForUser(userId);
  }

  /**
   * Update a user by ID.
   */
  @ApiOkResponse({ description: 'The user has been successfully updated.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateOneUser(@Param('id') id: string, @Body() data: UpdateUser): Promise<User> {
    const userId = parseInt(id);
    return this.usersService.update(userId, data);
  }

  /**
   * Delete a user by ID, ensuring the user does not delete themselves.
   */
  @ApiOkResponse({ description: 'The user has been successfully deleted.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiBadRequestResponse({ description: 'Cannot delete yourself.' })
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteOneUser(@Param('id') id: string, @Request() req): Promise<User> {
    const userId = parseInt(id);
    if (req.user.username === userId) {
      throw new BadRequestException('You cannot delete yourself.');
    }
    return this.usersService.delete(userId);
  }

  /**
   * Create a new user and send a registration confirmation email.
   */
  @ApiCreatedResponse({ description: 'The user has been successfully created.' })
  @Post()
  async create(@Body() createUser: CreateUser): Promise<User> {
    const createdUser = await this.usersService.create(createUser);

    try {
      await this.usersService.sendRegistrationConfirmationEmail(createdUser);
    } catch (error) {
      this.logger.error("Couldn't send registration confirmation email", error);
    }

    return createdUser;
  }
}
