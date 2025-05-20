import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { AppService, Car } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {
    return await this.appService.getHello();
  }

  @Get('cars')
  async getAllCars(): Promise<Car[]> {
    return await this.appService.getAllCars();
  }

  @Get('cars/:id')
  async getCarById(@Param('id') id: string): Promise<Car> {
    const car = await this.appService.getCarById(id);
    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }
    return car;
  }

  @Post('cars')
  async createCar(@Body() carData: Omit<Car, 'id'>): Promise<Car> {
    return await this.appService.createCar(carData);
  }

  @Put('cars/:id')
  async updateCar(
    @Param('id') id: string,
    @Body() carData: Partial<Car>,
  ): Promise<Car> {
    const updatedCar = await this.appService.updateCar(id, carData);
    if (!updatedCar) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }
    return updatedCar;
  }

  @Delete('cars/:id')
  async deleteCar(@Param('id') id: string): Promise<void> {
    const deleted = await this.appService.deleteCar(id);
    if (!deleted) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }
  }
}
