import { UserRepository, UserQuery } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/errors';

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async getAllUsers(query: UserQuery) {
    return await this.repository.findAll(query);
  }

  async getUserById(id: number) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return user;
  }

  async createUser(data: any) {
    const existingUser = await this.repository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError(400, 'User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return await this.repository.create({
      fullName: data.fullName,
      email: data.email,
      passwordHash: hashedPassword,
      role: data.role as any,
      isActive: data.isActive,
      preferences: data.preferences,
    });
  }

  async updateUser(id: number, data: any) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await this.repository.findByEmail(data.email);
      if (existingUser) {
        throw new AppError(400, 'User with this email already exists');
      }
    }

    const updateData: any = {
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      isActive: data.isActive,
      preferences: data.preferences,
    };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    return await this.repository.update(id, updateData);
  }

  async updateStatus(id: number, isActive: boolean) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return await this.repository.update(id, { isActive });
  }
}

export const userService = new UserService();
