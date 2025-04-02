import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../cities/entities/city.entity';
import { ApiResponse } from '../common/interfaces/response.interface';
import { Department } from '../departments/entities/department.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<ApiResponse> {
    try {
      const errors: string[] = [];

      if (!createCompanyDto.nombre) {
        errors.push('Name is required');
      }
      if (!createCompanyDto.direccion) {
        errors.push('Addres is required');
      }
      if (!createCompanyDto.cityId) {
        errors.push('CityId is required');
      }
      if (!createCompanyDto.departmentId) {
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

      if (createCompanyDto.cityId && createCompanyDto.departmentId) {
        const city = await this.cityRepository.findOne({
          where: { id: createCompanyDto.cityId },
          relations: ['department'],
        });
        if (!city) {
          throw new NotFoundException(
            `City with id ${createCompanyDto.cityId} not found`,
          );
        }
        if (city.department.id !== createCompanyDto.departmentId) {
          throw new BadRequestException(
            `City with id ${createCompanyDto.cityId} does not belong to department with id ${createCompanyDto.departmentId}`,
          );
        }
      }

      const company = this.companyRepository.create(createCompanyDto);
      await this.companyRepository.save(company);

      return {
        success: true,
        information: [company],
        message: 'Company created successfully',
        status: 201,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error creating company: ' + error.message,
        status: 500,
      };
    }
  }

  async findAll(): Promise<ApiResponse> {
    try {
      const companies = await this.companyRepository.find({
        relations: ['city', 'department', 'users', 'products'],
      });

      return {
        success: true,
        information: companies,
        message: 'Companies retrieved successfully',
        status: 200,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error retrieving companies: ' + error.message,
        status: 500,
      };
    }
  }

  async findOne(id: number): Promise<ApiResponse> {
    try {
      const company = await this.companyRepository.findOne({
        where: { id },
        relations: ['city', 'department', 'users', 'products'],
      });

      if (!company) {
        return {
          success: false,
          information: [],
          message: 'Company not found',
          status: 404,
        };
      }

      return {
        success: true,
        information: [company],
        message: 'Company found successfully',
        status: 200,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error finding company: ' + error.message,
        status: 500,
      };
    }
  }

  async update(
    id: number,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<ApiResponse> {
    try {
      const company = await this.companyRepository.findOne({
        where: { id },
      });

      if (!company) {
        return {
          success: false,
          information: [],
          message: 'Company not found',
          status: 404,
        };
      }

      const errors: string[] = [];

      if (updateCompanyDto.nombre === null) {
        errors.push('Name is required');
      }
      if (updateCompanyDto.direccion === null) {
        errors.push('Adrees is required');
      }
      if (updateCompanyDto.cityId === null) {
        errors.push('CityId is required');
      }
      if (updateCompanyDto.departmentId === null) {
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

      if (updateCompanyDto.cityId && updateCompanyDto.departmentId) {
        const city = await this.cityRepository.findOne({
          where: { id: updateCompanyDto.cityId },
          relations: ['department'],
        });
        if (!city) {
          throw new NotFoundException(
            `City with id ${updateCompanyDto.cityId} not found`,
          );
        }
        if (city.department.id !== updateCompanyDto.departmentId) {
          throw new BadRequestException(
            `City with id ${updateCompanyDto.cityId} does not belong to department with id ${updateCompanyDto.departmentId}`,
          );
        }
      }

      await this.companyRepository.update(id, updateCompanyDto);

      const updatedCompany = await this.companyRepository.findOne({
        where: { id },
        relations: ['city', 'department', 'users', 'products'],
      });

      return {
        success: true,
        information: [updatedCompany],
        message: 'Company updated successfully',
        status: 200,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error updating company: ' + error.message,
        status: 500,
      };
    }
  }

  async remove(id: number): Promise<ApiResponse> {
    try {
      const company = await this.companyRepository.findOne({
        where: { id },
        relations: ['users', 'products'],
      });

      if (!company) {
        return {
          success: false,
          information: [],
          message: 'Company not found',
          status: 404,
        };
      }

      if (company.users?.length > 0 || company.products?.length > 0) {
        return {
          success: false,
          information: [],
          message:
            'Cannot delete company because it has associated users or products',
          status: 400,
        };
      }

      await this.companyRepository.remove(company);
      return {
        success: true,
        information: [company],
        message: 'Company deleted successfully',
        status: 200,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error deleting company: ' + error.message,
        status: 500,
      };
    }
  }
}
