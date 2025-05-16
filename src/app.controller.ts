import { Controller, Get, Param } from '@nestjs/common';
import { AppService, Car } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('cars')
  getAllCars(): Car[] {
    return this.appService.getAllCars();
  }

  @Get('cars/:id')
  getCarById(@Param('id') id: string) {
    return this.appService.getCarById(id);
  }
}