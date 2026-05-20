import { AppDataSource } from '../database/connection';
import { UserEntity } from '../entities/UserEntity';
import { hash, compare } from 'bcrypt';

export class AuthService {
  private userRepository = AppDataSource.getRepository(UserEntity);

  async register(username: string, password: string): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const passwordHash = await hash(password, 10);
    const user = this.userRepository.create({ username, passwordHash });
    return this.userRepository.save(user);
  }

  async login(username: string, password: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new Error('Invalid username or password');
    }

    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }

    return user;
  }

  async getUserById(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}

export const authService = new AuthService();
