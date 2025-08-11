import { IsString, IsEnum, IsNumber, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FundingStage } from '@prisma/client';

export class CreateEntrepreneurProfileDto {
  @ApiProperty({ example: 'TechCorp Inc.' })
  @IsString()
  companyName: string;

  @ApiProperty({ example: 'Technology' })
  @IsString()
  industry: string;

  @ApiProperty({ enum: FundingStage, example: FundingStage.EARLY_TRACTION })
  @IsEnum(FundingStage)
  fundingStage: FundingStage;

  @ApiProperty({ example: 500000, required: false })
  @IsOptional()
  @IsNumber()
  fundingAmount?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  equityOffered?: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  teamSize: number;

  @ApiProperty({ example: 2020, required: false })
  @IsOptional()
  @IsNumber()
  foundedYear?: number;
}
