import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNdaRequestDto {
  @ApiProperty({ example: 'user-uuid-here' })
  @IsString()
  @IsUUID()
  recipientId: string;

  @ApiProperty({ example: 'pitch-uuid-here' })
  @IsString()
  @IsUUID()
  pitchId: string;

  @ApiProperty({ example: 'I would like to request access to your detailed pitch information', required: false })
  @IsOptional()
  @IsString()
  message?: string;
}
