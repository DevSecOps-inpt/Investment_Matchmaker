import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ example: 'user-uuid-here' })
  @IsString()
  userId: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.CONNECTION_REQUEST })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ example: 'New Connection Request' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'John Doe sent you a connection request' })
  @IsString()
  message: string;

  @ApiProperty({ example: { connectionId: 'connection-uuid' }, required: false })
  @IsOptional()
  @IsObject()
  data?: any;
}
