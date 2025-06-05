import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthCheckController } from './health-check.controller';
import { DogHealthIndicator } from './dog.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthCheckController],
  providers: [DogHealthIndicator],
})
export class HealthCheckModule {}
