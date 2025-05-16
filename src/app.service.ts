import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Interval } from '@nestjs/schedule';

export interface Car {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  speed: number;
  status: string;
  timestamp?: string;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private cars: Car[] = [];
  private readonly apiUrl =
    'https://68260a2e397e48c91314bda1.mockapi.io/api/v1/cars';
  private readonly targetCarCount = 10;

  constructor(private readonly httpService: HttpService) {
    this.initializeCars();
  }

  async initializeCars() {
    try {
      const response = await firstValueFrom(
        this.httpService.get<Car[]>(this.apiUrl),
      );
      this.cars = response.data;

      if (this.cars.length < this.targetCarCount) {
        await this.generateAdditionalCars();
      }

      this.logger.log(`Initialized with ${this.cars.length} cars`);
    } catch (error) {
      this.logger.error('Failed to fetch initial car data', error);
      await this.generateAllCars();
    }
  }

  private async generateAdditionalCars() {
    const carsToGenerate = this.targetCarCount - this.cars.length;
    this.logger.log(`Generating ${carsToGenerate} additional cars`);

    for (let i = 0; i < carsToGenerate; i++) {
      const newCar: Omit<Car, 'id'> = {
        name: `Car ${String.fromCharCode(65 + ((this.cars.length + i) % 26))}`,
        latitude: -1.94 + Math.random() * 0.1,
        longitude: 30.05 + Math.random() * 0.1,
        speed: Math.floor(Math.random() * 60) + 30,
        status: ['Moving', 'Stopped', 'Idle'][Math.floor(Math.random() * 3)],
        timestamp: new Date().toISOString(),
      };

      try {
        const response = await firstValueFrom(
          this.httpService.post<Car>(this.apiUrl, newCar),
        );
        this.cars.push(response.data);
        this.logger.log(`Created new car in API: ${response.data.id}`);
      } catch (error) {
        this.logger.error('Failed to create car in API', error);
        // Fallback to local only
        const localCar = {
          ...newCar,
          id: (this.cars.length + i + 1).toString(),
        };
        this.cars.push(localCar);
      }
    }
  }

  private async generateAllCars() {
    this.logger.log(`Generating all ${this.targetCarCount} cars`);
    this.cars = [];

    for (let i = 0; i < this.targetCarCount; i++) {
      const newCar: Omit<Car, 'id'> = {
        name: `Car ${String.fromCharCode(65 + (i % 26))}`,
        latitude: -1.94 + Math.random() * 0.1,
        longitude: 30.05 + Math.random() * 0.1,
        speed: Math.floor(Math.random() * 60) + 30,
        status: ['Moving', 'Stopped', 'Idle'][Math.floor(Math.random() * 3)],
        timestamp: new Date().toISOString(),
      };

      try {
        const response = await firstValueFrom(
          this.httpService.post<Car>(this.apiUrl, newCar),
        );
        this.cars.push(response.data);
        this.logger.log(`Created new car in API: ${response.data.id}`);
      } catch (error) {
        this.logger.error('Failed to create car in API', error);
        // Fallback to local only
        const localCar = {
          ...newCar,
          id: (i + 1).toString(),
        };
        this.cars.push(localCar);
      }
    }
  }

  @Interval(5000)
  async updateCarPositions() {
    if (this.cars.length === 0) {
      await this.initializeCars();
      return;
    }

    this.logger.log('Updating car positions...');

    this.cars = await Promise.all(
      this.cars.map(async (car) => {
        if (car.status !== 'Moving') {
          return car;
        }

        const speedFactor = car.speed / 10; 
        const distance = speedFactor * 0.001; 

       
        const angle = Math.random() * Math.PI * 2; 
        const latChange = Math.sin(angle) * distance;
        const lngChange = Math.cos(angle) * distance;

        // Random chance to change status (10% chance)
        const newStatus =
          Math.random() > 0.9
            ? ['Moving', 'Stopped', 'Idle'][Math.floor(Math.random() * 3)]
            : car.status;

        const updatedCar = {
          ...car,
          latitude: parseFloat((car.latitude + latChange).toFixed(6)),
          longitude: parseFloat((car.longitude + lngChange).toFixed(6)),
          status: newStatus,
          timestamp: new Date().toISOString(),
        };

        try {
          // Update remote API
          await firstValueFrom(
            this.httpService.put(`${this.apiUrl}/${car.id}`, updatedCar),
          );
          return updatedCar;
        } catch (error) {
          this.logger.error(`Failed to update car ${car.id} in API`, error);
          return updatedCar; // Return updated car even if API update fails
        }
      }),
    );

    this.logger.log('Car positions updated');
  }

  getAllCars(): Car[] {
    return this.cars;
  }

  getCarById(id: string): Car | undefined {
    return this.cars.find((car) => car.id === id);
  }

  getHello(): string {
    return (
      'Hello from Car Tracker! Now tracking ' + this.cars.length + ' vehicles.'
    );
  }
}
