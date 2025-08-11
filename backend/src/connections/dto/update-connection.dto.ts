import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ConnectionStatus } from '@prisma/client';

export class UpdateConnectionDto {
  @ApiProperty({ enum: ConnectionStatus, example: ConnectionStatus.ACCEPTED })
  @IsEnum(ConnectionStatus)
  status: ConnectionStatus;
}
