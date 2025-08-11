import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePitchChatDto {
  @ApiProperty({
    description: 'ID of the pitch to discuss',
    example: 'clx1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  pitchId: string;

  @ApiProperty({
    description: 'ID of the investor to start the discussion with',
    example: 'clx1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  investorId: string;
}
