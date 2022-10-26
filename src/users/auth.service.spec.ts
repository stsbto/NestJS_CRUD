import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './users.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((users) => users.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        AuthService,
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('Can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('Creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');
    const [salt, hash] = user.password.split('.');
    expect(user.password).not.toEqual('asdf');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('Throws an error if user signup with email that is in use', async () => {
    await service.signup('asdf@asdf.com', 'asdf');
    try {
      await service.signup('asdf@asdf.com', 'asdf');
    } catch (error) {
      expect(error).toBeDefined();
      // expect(error.message).toBe('email in use');
    }
  });

  it('Throws an error if user signin with email not found', async () => {
    try {
      await service.signin('asdf@asdf.com', 'asdf');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('Throws an error if an invalid password is provided', async () => {
    await service.signup('asdasdadsads@asdf.com', '1231231');
    try {
      await service.signin('asdasdadsads@asdf', '789787');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('Return a user if correct password is provided', async () => {
    await service.signup('asdf@asdf.com', 'test1234');
    const use = await service.signin('asdf@asdf.com', 'test1234');
    expect(use).toBeDefined();
  });
});
