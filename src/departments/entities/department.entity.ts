import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { City } from '../../cities/entities/city.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @OneToMany(() => City, (city) => city.department)
  cities: City[];

  @OneToMany(() => Company, (company) => company.department)
  companies: Company[];
}
