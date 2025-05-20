import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interval } from '@nestjs/schedule';
import { CarEntity } from './entities/car.entity';

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
  private readonly targetCarCount = 15;
  private readonly carsPerStatus = 5; // 15 cars ÷ 3 statuses = 5 each

  constructor(
    @InjectRepository(CarEntity)
    private readonly carRepository: Repository<CarEntity>,
  ) {
    this.initializeCars();
  }

  async initializeCars() {
    try {
      // Count existing cars in the database
      const carCount = await this.carRepository.count();
      this.logger.log(`Found ${carCount} cars in database`);

      if (carCount < this.targetCarCount) {
        await this.generateAdditionalCars(this.targetCarCount - carCount);
      }

      await this.balanceCarStatuses(); // Ensure we have correct distribution
      this.logger.log(
        `Initialized with ${await this.carRepository.count()} cars`,
      );
    } catch (error) {
      this.logger.error('Failed to fetch initial car data', error);
      await this.generateAllCars();
    }
  }

  private async balanceCarStatuses() {
    // Get all cars from the database
    const cars = await this.carRepository.find();

    const statusCounts = {
      Moving: 0,
      Stopped: 0,
      Idle: 0,
    };

    // Count current statuses
    cars.forEach((car) => statusCounts[car.status]++);
    this.logger.log(
      `Current status distribution: Moving: ${statusCounts.Moving}, Stopped: ${statusCounts.Stopped}, Idle: ${statusCounts.Idle}`,
    );

    // Adjust statuses to meet our desired distribution
    for (const car of cars) {
      // If we have too many in this status, change it
      if (statusCounts[car.status] > this.carsPerStatus) {
        // Find a status that needs more cars
        const neededStatus = Object.entries(statusCounts).find(
          ([_, count]) => count < this.carsPerStatus,
        )?.[0] as 'Moving' | 'Stopped' | 'Idle';

        if (neededStatus) {
          statusCounts[car.status]--;
          statusCounts[neededStatus]++;

          car.status = neededStatus;
          car.speed =
            neededStatus === 'Moving' ? Math.floor(Math.random() * 60) + 30 : 0;
          car.timestamp = new Date().toISOString();

          await this.carRepository.save(car);
          this.logger.log(`Updated car ${car.id} status to ${neededStatus}`);
        }
      }
    }
  }

  private async generateAdditionalCars(carsToGenerate: number) {
    this.logger.log(`Generating ${carsToGenerate} additional cars`);

    const statuses: ('Moving' | 'Stopped' | 'Idle')[] = [
      'Moving',
      'Stopped',
      'Idle',
    ];
    let statusIndex = 0;

    // Get existing car count to continue the naming sequence
    const existingCount = await this.carRepository.count();

    for (let i = 0; i < carsToGenerate; i++) {
      // Distribute statuses evenly
      const status = statuses[statusIndex % 3];
      statusIndex++;

      const newCar = this.carRepository.create({
        name: `Car ${String.fromCharCode(65 + ((existingCount + i) % 26))}`,
        latitude: -1.94 + Math.random() * 0.1,
        longitude: 30.05 + Math.random() * 0.1,
        speed: status === 'Moving' ? Math.floor(Math.random() * 60) + 30 : 0,
        status: status,
        timestamp: new Date().toISOString(),
      });

      try {
        const savedCar = await this.carRepository.save(newCar);
        this.logger.log(`Created new car in database: ${savedCar.id}`);
      } catch (error) {
        this.logger.error('Failed to create car in database', error);
      }
    }
  }

  private async generateAllCars() {
    this.logger.log(`Generating all ${this.targetCarCount} cars from scratch`);

    // Clear existing cars
    try {
      await this.carRepository.clear();
      this.logger.log('Cleared existing cars from database');
    } catch (error) {
      this.logger.error('Failed to clear existing cars', error);
    }

    const statuses: ('Moving' | 'Stopped' | 'Idle')[] = [
      'Moving',
      'Stopped',
      'Idle',
    ];

    for (let i = 0; i < this.targetCarCount; i++) {
      // Distribute statuses evenly (5 each)
      const status = statuses[Math.floor(i / this.carsPerStatus) % 3];

      const newCar = this.carRepository.create({
        name: `Car ${String.fromCharCode(65 + (i % 26))}`,
        latitude: -1.94 + Math.random() * 0.1,
        longitude: 30.05 + Math.random() * 0.1,
        speed: status === 'Moving' ? Math.floor(Math.random() * 60) + 30 : 0,
        status: status,
        timestamp: new Date().toISOString(),
      });

      try {
        const savedCar = await this.carRepository.save(newCar);
        this.logger.log(`Created new car in database: ${savedCar.id}`);
      } catch (error) {
        this.logger.error('Failed to create car in database', error);
      }
    }
  }

  @Interval(5000)
  async updateCarPositions() {
    // Get count of cars in database
    const carCount = await this.carRepository.count();

    if (carCount === 0) {
      await this.initializeCars();
      return;
    }

    this.logger.log('Updating car positions...');

    // Get all moving cars
    const movingCars = await this.carRepository.find({
      where: { status: 'Moving' },
    });

    for (const car of movingCars) {
      const speedFactor = car.speed / 10;
      const distance = speedFactor * 0.001;
      const angle = Math.random() * Math.PI * 2;
      const latChange = Math.sin(angle) * distance;
      const lngChange = Math.cos(angle) * distance;

      car.latitude = parseFloat((car.latitude + latChange).toFixed(6));
      car.longitude = parseFloat((car.longitude + lngChange).toFixed(6));
      car.timestamp = new Date().toISOString();

      try {
        await this.carRepository.save(car);
      } catch (error) {
        this.logger.error(`Failed to update car ${car.id} in database`, error);
      }
    }

    this.logger.log(`Updated positions for ${movingCars.length} moving cars`);
  }

  async getAllCars(): Promise<CarEntity[]> {
    return this.carRepository.find();
  }

  async getCarById(id: string): Promise<CarEntity | null> {
    return this.carRepository.findOne({ where: { id } });
  }

  async createCar(carData: Omit<Car, 'id'>): Promise<CarEntity> {
    const newCar = this.carRepository.create({
      ...carData,
      timestamp: carData.timestamp || new Date().toISOString(),
    });

    this.logger.log(`Creating new car: ${newCar.name}`);
    return this.carRepository.save(newCar);
  }

  async updateCar(
    id: string,
    carData: Partial<Car>,
  ): Promise<CarEntity | null> {
    const car = await this.getCarById(id);

    if (!car) {
      this.logger.warn(`Attempted to update non-existent car with ID: ${id}`);
      return null;
    }

    // Update the timestamp automatically if not provided
    if (!carData.timestamp) {
      carData.timestamp = new Date().toISOString();
    }

    // Update speed to 0 if status changes to Stopped or Idle
    if (
      carData.status &&
      ['Stopped', 'Idle'].includes(carData.status) &&
      car.status === 'Moving'
    ) {
      carData.speed = 0;
    }

    // Merge the changes with the existing car
    const updatedCar = this.carRepository.merge(car, carData);

    this.logger.log(`Updating car ${id}: ${JSON.stringify(carData)}`);
    return this.carRepository.save(updatedCar);
  }

  async deleteCar(id: string): Promise<boolean> {
    const car = await this.getCarById(id);

    if (!car) {
      this.logger.warn(`Attempted to delete non-existent car with ID: ${id}`);
      return false;
    }

    this.logger.log(`Deleting car ${id}`);
    await this.carRepository.remove(car);
    return true;
  }

  async getStatusDistribution(): Promise<{ status: string; count: number }[]> {
    const movingCount = await this.carRepository.count({
      where: { status: 'Moving' },
    });
    const stoppedCount = await this.carRepository.count({
      where: { status: 'Stopped' },
    });
    const idleCount = await this.carRepository.count({
      where: { status: 'Idle' },
    });

    return [
      { status: 'Moving', count: movingCount },
      { status: 'Stopped', count: stoppedCount },
      { status: 'Idle', count: idleCount },
    ];
  }

  async getHello(): Promise<string> {
    const distribution = await this.getStatusDistribution();
    const formattedDistribution = distribution
      .map((d) => `${d.status}: ${d.count}`)
      .join(', ');
    const totalCars = await this.carRepository.count();
    return `Hello from Car Tracker! Tracking ${totalCars} vehicles (${formattedDistribution})`;
  }
}
