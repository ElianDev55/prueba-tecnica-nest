import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponse } from '../common/interfaces/response.interface';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { City } from './entities/city.entity';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async create(createCityDto: CreateCityDto): Promise<ApiResponse> {
    try {
      const errors: string[] = [];

      if (!createCityDto.nombre) {
        errors.push('Name is required');
      }
      if (!createCityDto.departmentId) {
        errors.push('DepartmentId is required');
      }

      if (errors.length > 0) {
        return {
          success: false,
          information: [],
          message: errors.join(', '),
          status: 400,
        };
      }

      const city = this.cityRepository.create(createCityDto);
      await this.cityRepository.save(city);

      return {
        success: true,
        information: [city],
        message: 'City created successfully',
        status: 201,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error creating city: ' + error.message,
        status: 500,
      };
    }
  }

  async findAll(): Promise<ApiResponse> {
    try {
      const cities = await this.cityRepository.find({
        relations: ['department', 'companies'],
      });

      return {
        success: true,
        information: cities,
        message: 'Cities retrieved successfully',
        status: 200,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error retrieving cities: ' + error.message,
        status: 500,
      };
    }
  }

  async findOne(id: number): Promise<ApiResponse> {
    try {
      const city = await this.cityRepository.findOne({
        where: { id },
        relations: ['department', 'companies'],
      });

      if (!city) {
        return {
          success: false,
          information: [],
          message: 'City not found',
          status: 404,
        };
      }

      return {
        success: true,
        information: [city],
        message: 'City found successfully',
        status: 200,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error finding city: ' + error.message,
        status: 500,
      };
    }
  }

  async update(id: number, updateCityDto: UpdateCityDto): Promise<ApiResponse> {
    try {
      const city = await this.cityRepository.findOne({
        where: { id },
      });

      if (!city) {
        return {
          success: false,
          information: [],
          message: 'City not found',
          status: 404,
        };
      }

      const errors: string[] = [];

      if (updateCityDto.nombre === null) {
        errors.push('Name is required');
      }
      if (updateCityDto.departmentId === null) {
        errors.push('DepartmentId is required');
      }

      if (errors.length > 0) {
        return {
          success: false,
          information: [],
          message: errors.join(', '),
          status: 400,
        };
      }

      await this.cityRepository.update(id, updateCityDto);

      const updatedCity = await this.cityRepository.findOne({
        where: { id },
        relations: ['department', 'companies'],
      });

      return {
        success: true,
        information: [updatedCity],
        message: 'City updated successfully',
        status: 200,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error updating city: ' + error.message,
        status: 500,
      };
    }
  }

  async remove(id: number): Promise<ApiResponse> {
    try {
      const city = await this.cityRepository.findOne({
        where: { id },
        relations: ['companies'],
      });

      if (!city) {
        return {
          success: false,
          information: [],
          message: 'City not found',
          status: 404,
        };
      }

      if (city.companies?.length > 0) {
        return {
          success: false,
          information: [],
          message: 'Cannot delete city because it has associated companies',
          status: 400,
        };
      }

      await this.cityRepository.remove(city);
      return {
        success: true,
        information: [city],
        message: 'City deleted successfully',
        status: 200,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error deleting city: ' + error.message,
        status: 500,
      };
    }
  }
}
