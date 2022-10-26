/*
https://docs.nestjs.com/fundamentals/testing#unit-testing
*/

import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './users.entity';
describe('UsersController', () => {
  let usersController: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'asdf@asdf',
          password: 'asdf',
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 123, email, password: 'asdf' } as User]);
      },
      // update: (id: number, user: Partial<User>) => {
      //   return Promise.resolve({} as User);
      // },
    };
    fakeAuthService = {
      // signup: () => {},
      signin: (email: string, password: string) => {
        return Promise.resolve({
          id: 5,
          email,
          password,
        } as User);
      },
    };
    const moduleRef = await Test.createTestingModule({
      // imports: [], // Add
      controllers: [UsersController], // Add
      providers: [
        { provide: UsersService, useValue: fakeUsersService },
        { provide: AuthService, useValue: fakeAuthService },
      ], // Add
    }).compile();

    usersController = moduleRef.get<UsersController>(UsersController);
  });

  it('should be defined 😮', () => {
    expect(usersController).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email 😀', async () => {
    const users = await usersController.findAllUsers('asdf111@asdf.com');
    expect(users.length).not.toEqual(0);
    expect(users[0].email).toEqual('asdf111@asdf.com');
  });

  it('findUser returns a single user with given id', async () => {
    const user = usersController.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throw error with given id is not found', async () => {
    fakeUsersService.findOne = () => null;
    try {
      await usersController.findUser('1');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toBe('use not found');
    }
  });
  it('signin updates session object and returns user', async () => {
    const session = { userId: 123123123 };
    const user = await usersController.signin(
      { email: 'asdf@asdf', password: 'test1324' } as User,
      session,
    );
    expect(session.userId).toEqual(5);
    expect(user.id).toEqual(5);
  });
});
