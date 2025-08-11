import { Module } from '@nestjs/common';
import { PitchesService } from './pitches.service';
import { PitchesController } from './pitches.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PitchesController],
  providers: [PitchesService],
  exports: [PitchesService],
})
export class PitchesModule {}
