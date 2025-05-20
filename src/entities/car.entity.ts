import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cars')
export class CarEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('double precision', { nullable: true })
  latitude: number;

  @Column('double precision', { nullable: true })
  longitude: number;

  @Column('integer')
  speed: number;

  @Column({
    type: 'enum',
    enum: ['Moving', 'Stopped', 'Idle'],
    default: 'Stopped',
  })
  status: 'Moving' | 'Stopped' | 'Idle';

  @Column({ nullable: true })
  timestamp: string;
}
