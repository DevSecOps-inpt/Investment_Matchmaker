import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConnectionDto {
  @ApiProperty({ example: 'user-uuid-here' })
  @IsString()
  @IsUUID()
  recipientId: string;

  @ApiProperty({ example: 'pitch-uuid-here', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  pitchId?: string;

  @ApiProperty({ example: 'I would like to connect and discuss your pitch', required: false })
  @IsOptional()
  @IsString()
  message?: string;
}
