import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcryptjs from 'bcryptjs';

import { Repository } from 'typeorm';
import { ApiResponse } from '../common/interfaces/response.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<ApiResponse> {
    try {
      const errors: string[] = [];

      if (!createUserDto.nombre) {
        errors.push('Nombre is required');
      }
      if (!createUserDto.email) {
        errors.push('Email is required');
      }
      if (!createUserDto.password) {
        errors.push('Password is required');
      }

      if (errors.length > 0) {
        return {
          success: false,
          information: [],
          message: errors.join(', '),
          status: 400,
        };
      }

      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        return {
          success: false,
          information: [],
          message: 'Email already registered',
          status: 400,
        };
      }

      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);

      const savedUser = await this.userRepository.findOne({
        where: { id: user.id },
      });

      if (!savedUser) {
        return {
          success: false,
          information: [],
          message: 'Error retrieving created user',
          status: 500,
        };
      }

      const { password: _, ...userWithoutPassword } = savedUser;

      return {
        success: true,
        information: [userWithoutPassword],
        message: 'User created successfully',
        status: 201,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        information: [],
        message: `Error creating user: ${errorMessage}`,
        status: 500,
      };
    }
  }

  async findAll(): Promise<ApiResponse> {
    try {
      const users = await this.userRepository.find({
        relations: ['company'],
        select: ['id', 'nombre', 'email', 'company'],
      });

      return {
        success: true,
        information: users,
        message: 'Users retrieved successfully',
        status: 200,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        information: [],
        message: `Error retrieving users: ${errorMessage}`,
        status: 500,
      };
    }
  }

  async findOne(id: number): Promise<ApiResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['company'],
        select: ['id', 'nombre', 'email', 'company'],
      });

      if (!user) {
        return {
          success: false,
          information: [],
          message: 'User not found',
          status: 404,
        };
      }

      return {
        success: true,
        information: [user],
        message: 'User found successfully',
        status: 200,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        information: [],
        message: `Error finding user: ${errorMessage}`,
        status: 500,
      };
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<ApiResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        return {
          success: false,
          information: [],
          message: 'User not found',
          status: 404,
        };
      }

      const errors: string[] = [];

      if (updateUserDto.nombre === null) {
        errors.push('Nombre is required');
      }
      if (updateUserDto.email === null) {
        errors.push('Email is required');
      }
      if (updateUserDto.password === null) {
        errors.push('Password is required');
      }

      if (errors.length > 0) {
        return {
          success: false,
          information: [],
          message: errors.join(', '),
          status: 400,
        };
      }

      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateUserDto.email },
        });

        if (existingUser) {
          return {
            success: false,
            information: [],
            message: 'Email already registered',
            status: 400,
          };
        }
      }

      const updateData = { ...updateUserDto };
      if (updateData.password) {
        try {
          updateData.password = await bcryptjs.hash(updateData.password, 10);
        } catch {
          return {
            success: false,
            information: [],
            message: 'Error hashing password',
            status: 500,
          };
        }
      }

      await this.userRepository.update(id, updateData);

      const updatedUser = await this.userRepository.findOne({
        where: { id },
        relations: ['company'],
        select: ['id', 'nombre', 'email', 'company'],
      });

      return {
        success: true,
        information: [updatedUser],
        message: 'User updated successfully',
        status: 200,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        information: [],
        message: `Error updating user: ${errorMessage}`,
        status: 500,
      };
    }
  }

  async remove(id: number): Promise<ApiResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['company'],
      });

      if (!user) {
        return {
          success: false,
          information: [],
          message: 'User not found',
          status: 404,
        };
      }

      await this.userRepository.remove(user);

      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        information: [userWithoutPassword],
        message: 'User deleted successfully',
        status: 200,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        information: [],
        message: `Error deleting user: ${errorMessage}`,
        status: 500,
      };
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password'],
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'nombre'],
    });
  }
}
