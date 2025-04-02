import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponse } from '../common/interfaces/response.interface';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department } from './entities/department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<ApiResponse> {
    try {
      const errors: string[] = [];

      if (!createDepartmentDto.nombre) {
        errors.push('Name is required');
      }

      if (errors.length > 0) {
        return {
          success: false,
          information: [],
          message: errors.join(', '),
          status: 400,
        };
      }

      const department = this.departmentRepository.create(createDepartmentDto);
      await this.departmentRepository.save(department);

      return {
        success: true,
        information: [department],
        message: 'Department created successfully',
        status: 201,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error creating department: ' + error.message,
        status: 500,
      };
    }
  }

  async findAll(): Promise<ApiResponse> {
    try {
      const departments = await this.departmentRepository.find({
        relations: ['cities', 'companies'],
      });

      return {
        success: true,
        information: departments,
        message: 'Departments retrieved successfully',
        status: 200,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error retrieving departments: ' + error.message,
        status: 500,
      };
    }
  }

  async findOne(id: number): Promise<ApiResponse> {
    try {
      const department = await this.departmentRepository.findOne({
        where: { id },
        relations: ['cities', 'companies'],
      });

      if (!department) {
        return {
          success: false,
          information: [],
          message: 'Department not found',
          status: 404,
        };
      }

      return {
        success: true,
        information: [department],
        message: 'Department found successfully',
        status: 200,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error finding department: ' + error.message,
        status: 500,
      };
    }
  }

  async update(
    id: number,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<ApiResponse> {
    try {
      const department = await this.departmentRepository.findOne({
        where: { id },
      });

      if (!department) {
        return {
          success: false,
          information: [],
          message: 'Department not found',
          status: 404,
        };
      }

      const errors: string[] = [];

      if (updateDepartmentDto.nombre === null) {
        errors.push('Name is required');
      }

      if (errors.length > 0) {
        return {
          success: false,
          information: [],
          message: errors.join(', '),
          status: 400,
        };
      }

      await this.departmentRepository.update(id, updateDepartmentDto);

      const updatedDepartment = await this.departmentRepository.findOne({
        where: { id },
        relations: ['cities', 'companies'],
      });

      return {
        success: true,
        information: [updatedDepartment],
        message: 'Department updated successfully',
        status: 200,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error updating department: ' + error.message,
        status: 500,
      };
    }
  }

  async remove(id: number): Promise<ApiResponse> {
    try {
      const department = await this.departmentRepository.findOne({
        where: { id },
        relations: ['cities', 'companies'],
      });

      if (!department) {
        return {
          success: false,
          information: [],
          message: 'Department not found',
          status: 404,
        };
      }

      if (department.cities?.length > 0 || department.companies?.length > 0) {
        return {
          success: false,
          information: [],
          message:
            'Cannot delete department because it has associated cities or companies',
          status: 400,
        };
      }

      await this.departmentRepository.remove(department);
      return {
        success: true,
        information: [department],
        message: 'Department deleted successfully',
        status: 200,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error deleting department: ' + error.message,
        status: 500,
      };
    }
  }
}
