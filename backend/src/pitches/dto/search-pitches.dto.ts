import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FundingStage, PitchVisibility } from '@prisma/client';

export class SearchPitchesDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiProperty({ example: 'Technology', required: false })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({ enum: FundingStage, required: false })
  @IsOptional()
  @IsEnum(FundingStage)
  fundingStage?: FundingStage;

  @ApiProperty({ example: 'San Francisco', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 'AI platform', required: false })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({ enum: PitchVisibility, required: false })
  @IsOptional()
  @IsEnum(PitchVisibility)
  visibility?: PitchVisibility;
}
