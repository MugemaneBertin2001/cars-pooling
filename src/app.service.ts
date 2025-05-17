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
  status: 'Moving' | 'Stopped' | 'Idle';
  timestamp?: string;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private cars: Car[] = [];
  private readonly apiUrl = 'https://68260a2e397e48c91314bda1.mockapi.io/api/v1/cars';
  private readonly targetCarCount = 15;
  private readonly carsPerStatus = 5; // 15 cars ÷ 3 statuses = 5 each

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
      this.balanceCarStatuses(); // Ensure we have correct distribution
    } catch (error) {
      this.logger.error('Failed to fetch initial car data', error);
      await this.generateAllCars();
    }
  }

  private balanceCarStatuses() {
    const statusCounts = {
      Moving: 0,
      Stopped: 0,
      Idle: 0
    };

    // Count current statuses
    this.cars.forEach(car => statusCounts[car.status]++);

    // Adjust statuses to meet our desired distribution
    this.cars = this.cars.map(car => {
      // If we have too many in this status, change it
      if (statusCounts[car.status] > this.carsPerStatus) {
        // Find a status that needs more cars
        const neededStatus = Object.entries(statusCounts)
          .find(([_, count]) => count < this.carsPerStatus)?.[0] as 'Moving' | 'Stopped' | 'Idle';

        if (neededStatus) {
          statusCounts[car.status]--;
          statusCounts[neededStatus]++;
          return {
            ...car,
            status: neededStatus,
            speed: neededStatus === 'Moving' ? Math.floor(Math.random() * 60) + 30 : 0
          };
        }
      }
      return car;
    });
  }

  private async generateAdditionalCars() {
    const carsToGenerate = this.targetCarCount - this.cars.length;
    this.logger.log(`Generating ${carsToGenerate} additional cars`);

    const statuses: ('Moving' | 'Stopped' | 'Idle')[] = ['Moving', 'Stopped', 'Idle'];
    let statusIndex = 0;

    for (let i = 0; i < carsToGenerate; i++) {
      // Distribute statuses evenly
      const status = statuses[statusIndex % 3];
      statusIndex++;

      const newCar: Omit<Car, 'id'> = {
        name: `Car ${String.fromCharCode(65 + ((this.cars.length + i) % 26))}`,
        latitude: -1.94 + Math.random() * 0.1,
        longitude: 30.05 + Math.random() * 0.1,
        speed: status === 'Moving' ? Math.floor(Math.random() * 60) + 30 : 0,
        status: status,
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

    const statuses: ('Moving' | 'Stopped' | 'Idle')[] = ['Moving', 'Stopped', 'Idle'];
    let statusIndex = 0;

    for (let i = 0; i < this.targetCarCount; i++) {
      // Distribute statuses evenly (5 each)
      const status = statuses[Math.floor(i / this.carsPerStatus) % 3];

      const newCar: Omit<Car, 'id'> = {
        name: `Car ${String.fromCharCode(65 + (i % 26))}`,
        latitude: -1.94 + Math.random() * 0.1,
        longitude: 30.05 + Math.random() * 0.1,
        speed: status === 'Moving' ? Math.floor(Math.random() * 60) + 30 : 0,
        status: status,
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
        // Only move cars that are in Moving state
        if (car.status !== 'Moving') {
          return car;
        }

        const speedFactor = car.speed / 10;
        const distance = speedFactor * 0.001;
        const angle = Math.random() * Math.PI * 2;
        const latChange = Math.sin(angle) * distance;
        const lngChange = Math.cos(angle) * distance;

        const updatedCar = {
          ...car,
          latitude: parseFloat((car.latitude + latChange).toFixed(6)),
          longitude: parseFloat((car.longitude + lngChange).toFixed(6)),
          timestamp: new Date().toISOString(),
        };

        try {
          await firstValueFrom(
            this.httpService.put(`${this.apiUrl}/${car.id}`, updatedCar),
          );
          return updatedCar;
        } catch (error) {
          this.logger.error(`Failed to update car ${car.id} in API`, error);
          return updatedCar;
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

  getStatusDistribution(): { status: string; count: number }[] {
    const counts = { Moving: 0, Stopped: 0, Idle: 0 };
    this.cars.forEach(car => counts[car.status]++);
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }

  getHello(): string {
    const distribution = this.getStatusDistribution().map(d => `${d.status}: ${d.count}`).join(', ');
    return `Hello from Car Tracker! Tracking ${this.cars.length} vehicles (${distribution})`;
  }
}