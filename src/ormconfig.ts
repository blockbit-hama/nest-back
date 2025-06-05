// src/ormconfig.ts
import { DataSource } from 'typeorm'

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'test',
  database: 'test',
  entities: ['src/**/entity/*.entity.{ts,js}'],
  synchronize: false,
  migrations: ['src/migrations/*.js'],  // 경로 수정
  migrationsTableName: 'migrations',
});