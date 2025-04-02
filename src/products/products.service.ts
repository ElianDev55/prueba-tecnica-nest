import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponse } from '../common/interfaces/response.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ApiResponse> {
    try {
      const errors: string[] = [];

      if (!createProductDto.nombre) {
        errors.push('Name is required');
      }
      if (!createProductDto.descripcion) {
        errors.push('Description is required');
      }
      if (!createProductDto.precio) {
        errors.push('Price is required');
      }
      if (!createProductDto.companyId) {
        errors.push('CompanyId is required');
      }

      if (errors.length > 0) {
        return {
          success: false,
          information: [],
          message: errors.join(', '),
          status: 400,
        };
      }

      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);

      const savedProduct = await this.productRepository.findOne({
        where: { id: product.id },
        relations: ['company'],
      });

      return {
        success: true,
        information: [savedProduct],
        message: 'Product created successfully',
        status: 201,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error creating product: ' + error.message,
        status: 500,
      };
    }
  }

  async findAll(): Promise<ApiResponse> {
    try {
      const products = await this.productRepository.find({
        relations: ['company'],
      });

      return {
        success: true,
        information: products,
        message: 'Products retrieved successfully',
        status: 200,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error retrieving products: ' + error.message,
        status: 500,
      };
    }
  }

  async findOne(id: number): Promise<ApiResponse> {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['company'],
      });

      if (!product) {
        return {
          success: false,
          information: [],
          message: 'Product not found',
          status: 404,
        };
      }

      return {
        success: true,
        information: [product],
        message: 'Product found successfully',
        status: 200,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error finding product: ' + error.message,
        status: 500,
      };
    }
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ApiResponse> {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
      });

      if (!product) {
        return {
          success: false,
          information: [],
          message: 'Product not found',
          status: 404,
        };
      }

      const errors: string[] = [];

      if (updateProductDto.nombre === null) {
        errors.push('Name is required');
      }
      if (updateProductDto.descripcion === null) {
        errors.push('Description is required');
      }
      if (updateProductDto.precio === null) {
        errors.push('Price is required');
      }
      if (updateProductDto.companyId === null) {
        errors.push('CompanyId is required');
      }

      if (errors.length > 0) {
        return {
          success: false,
          information: [],
          message: errors.join(', '),
          status: 400,
        };
      }

      await this.productRepository.update(id, updateProductDto);

      const updatedProduct = await this.productRepository.findOne({
        where: { id },
        relations: ['company'],
      });

      return {
        success: true,
        information: [updatedProduct],
        message: 'Product updated successfully',
        status: 200,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error updating product: ' + error.message,
        status: 500,
      };
    }
  }

  async remove(id: number): Promise<ApiResponse> {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['company'],
      });

      if (!product) {
        return {
          success: false,
          information: [],
          message: 'Product not found',
          status: 404,
        };
      }

      await this.productRepository.remove(product);
      return {
        success: true,
        information: [product],
        message: 'Product deleted successfully',
        status: 200,
      };
    } catch (error) {
      return {
        success: false,
        information: [],
        message: 'Error deleting product: ' + error.message,
        status: 500,
      };
    }
  }
}
