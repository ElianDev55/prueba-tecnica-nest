import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiResponse } from '../common/interfaces/response.interface';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  create(@Body() createCityDto: CreateCityDto): Promise<ApiResponse> {
    return this.citiesService.create(createCityDto);
  }

  @Get()
  findAll(): Promise<ApiResponse> {
    return this.citiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ApiResponse> {
    return this.citiesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCityDto: UpdateCityDto,
  ): Promise<ApiResponse> {
    return this.citiesService.update(+id, updateCityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<ApiResponse> {
    return this.citiesService.remove(+id);
  }
}
