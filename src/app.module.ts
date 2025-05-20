import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { CarEntity } from './entities/car.entity';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgresql://car_pooling_yssd_user:DWXJ8dAjMwdfly5fCWhJpqjx7AJyuMxh@dpg-d0m9890gjchc739m4l50-a.oregon-postgres.render.com/car_pooling_yssd',
      autoLoadEntities: true,
      synchronize: true, 
      ssl: {
        rejectUnauthorized: false, 
      },
      migrationsRun: true,
      migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
    }),
    TypeOrmModule.forFeature([CarEntity]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
