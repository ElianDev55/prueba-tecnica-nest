import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { UsersService } from 'src/users/users.service';
import { ApiResponse } from '../common/interfaces/response.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register({
    nombre,
    email,
    password,
  }: RegisterDto): Promise<ApiResponse> {
    try {
      const user = await this.usersService.findByEmail(email);

      if (user) {
        throw new BadRequestException('User already exists');
      }

      await this.usersService.create({
        nombre,
        email,
        password,
      });

      return {
        success: true,
        information: [{ nombre, email }],
        message: 'User registered successfully',
        status: 201,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: error.message,
        status: 400,
      };
    }
  }

  async login({ email, password }: LoginDto): Promise<ApiResponse> {
    try {
      const user = await this.usersService.findByEmailWithPassword(email);
      if (!user) {
        throw new UnauthorizedException('email is wrong');
      }

      const isPasswordValid = await bcryptjs.compare(password, user.password);
      console.log('Resultado de bcrypt.compare:', isPasswordValid);

      if (!isPasswordValid) {
        throw new UnauthorizedException('password is wrong');
      }

      const payload = { nombre: user.nombre, email: user.email };
      const token = await this.jwtService.signAsync(payload);

      return {
        success: true,
        information: [{ token, email }],
        message: 'Login successful',
        status: 200,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: error.message,
        status: 401,
      };
    }
  }
}
