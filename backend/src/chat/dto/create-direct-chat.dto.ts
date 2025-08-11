import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDirectChatDto {
  @ApiProperty({
    description: 'ID of the user to start a direct chat with',
    example: 'clx1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  userId2: string;
}
