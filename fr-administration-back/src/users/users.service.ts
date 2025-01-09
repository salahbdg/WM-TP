import {
  BadRequestException, HttpException,
  Inject,
  Injectable, Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { UpdateUser } from './dto/updateUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUser } from './dto/createUser.dto';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
    @Inject('REGISTRATION_CONFIRMATION_SERVICE') private client: ClientProxy,
  ) {
    this.checkEmpty();
  }

  private logger = new Logger('UsersService');

  /**
   * Create a new user.
   * @param createUserData the data to create the user
   */
  async create(createUserData: CreateUser): Promise<User> {
    // check if the email is already used
    const existingUser = await this.repository.findOneBy({
      email: createUserData.email,
    });
    if (existingUser) {
      throw new BadRequestException('email already used');
    }
    const hashedPassword = await bcrypt.hash(createUserData.password, 10);
    const user = User.create();
    user.firstname = createUserData.firstname;
    user.lastname = createUserData.lastname;
    user.age = createUserData.age;
    user.email = createUserData.email;
    user.password = hashedPassword;
    user.verified = false;
    user.verificationToken = this.generateVerificationToken(16);
    return this.repository.save(user);
  }

  /**
   * Generate a random string of the given length.
   * @param n the length of the string
   */
  generateVerificationToken(n: number) : string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let token = '';
    for (let i = 0; i < n; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
  }

  /**
   * Check if the database contains a user, if not, create one.
   */
  async checkEmpty(): Promise<void> {
    if(process.env.DEFAULT_USER_PASS === undefined || process.env.DEFAULT_USER_EMAIL === undefined) return;
    const users = await this.findAll();
    if (users.length === 0) {
      console.log('No users found, creating default user');
      let newUser = await this.create(
          new CreateUser({
            firstname: 'admin',
            lastname: 'admin',
            age: 21,
            email: process.env.DEFAULT_USER_EMAIL,
            password: process.env.DEFAULT_USER_PASS,
          }));
      newUser.verified = true;
      this.repository.save(newUser);
    }
  }

  /**
   * Delete the user with the given user id.
   * @param userId the user id
   */
  async delete(userId: number): Promise<User> {
    const user = await this.findOne(userId);
    return this.repository.remove(user);
  }

  /**
   * Get all the users.
   */
  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  /**
   * Find one user by id.
   * @param userId the user id
   * @returns the user found
   * @throws {NotFoundException} if the user is not found
   */
  async findOne(userId: number): Promise<User | null> {
    const user = await this.repository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  /**
   * Find one user by email.
   * @param email the user email
   * @returns the user found
   * @throws {NotFoundException} if the user is not found
   */
  async findOneByEmail(email: string, mustBeVerified: boolean): Promise<User | null> {
    let user = await this.repository.findOneBy({ email: email });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    if(mustBeVerified && !user.verified){
      throw new HttpException('user not verified', 403);
    }
    return user;
  }

  /**
   * Verify one user (not verified) with the given verification token.
   * @param token the token
   * @returns the user verified
   * @throws {NotFoundException} if the user is not found
   * @throws {BadRequestException} if the user is already verified
   */
  async verifyUser(token: string): Promise<User | null> {
    const user = await this.repository.findOneBy({ verificationToken: token });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    if(user.verified){
        throw new HttpException('user already verified', 403);
    }
    user.verified = true;
    this.repository.save(user);
    return user;
  }

  /**
   * Update user details (first name or last name).
   * @param userId the user id
   * @param data the data to update
   */
  async update(userId: number, data: UpdateUser): Promise<User> {
    const user = await this.findOne(userId);
    if (data.password !== undefined) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    // merge the data
    const newUser = User.merge(user, {
      firstname: data.firstname,
      lastname: data.lastname,
      age: data.age,
      password: data.password,
    });
    return this.repository.save(newUser);
  }

  /**
   * Find many users by their ids.
   * @param ids the ids
   * @returns the users found or an empty array if none found
   */
  async findManyById(ids: number[]): Promise<User[]> {
    return this.repository.findBy({ id: In(ids) });
  }

  /**
   * Send a registration confirmation email to the given user.
   * @param email the user email
   * @param firstname the user firstname
   * @param lastname the user lastname
   * @param verificationToken the verification token
   */
  async sendRegistrationConfirmationEmail({
    email,
    firstname,
    lastname,
    verificationToken,
  }: User): Promise<void> {
    if(process.env.FRONTEND_URL === undefined) {
        this.logger.error("Couldn't send registration confirmation message. process.env.FRONTEND_URL is undefined");
        return;
    }
    const record = new RmqRecordBuilder({
      firstName: firstname,
      lastName: lastname,
      validationUrl: process.env.FRONTEND_URL + "verify?t=" + verificationToken,
      email,
    })
      .setOptions({
        contentType: 'application/json',
      })
      .build();
    await this.client.emit('registration', record).toPromise();
  }
}
