import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Hello! I would like to discuss your pitch.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Message type',
    enum: ['text', 'file', 'nda_request'],
    default: 'text',
    required: false,
  })
  @IsOptional()
  @IsIn(['text', 'file', 'nda_request'])
  type?: 'text' | 'file' | 'nda_request' = 'text';
}
