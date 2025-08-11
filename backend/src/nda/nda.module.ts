import { Module } from '@nestjs/common';
import { NdaService } from './nda.service';
import { NdaController } from './nda.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NdaController],
  providers: [NdaService],
  exports: [NdaService],
})
export class NdaModule {}
