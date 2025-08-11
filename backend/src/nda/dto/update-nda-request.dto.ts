import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NDAStatus } from '@prisma/client';

export class UpdateNdaRequestDto {
  @ApiProperty({ enum: NDAStatus, example: NDAStatus.ACCEPTED })
  @IsEnum(NDAStatus)
  status: NDAStatus;
}
