import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FundingStage, PitchVisibility } from '@prisma/client';

export class CreatePitchDto {
  @ApiProperty({ example: 'Revolutionary AI Platform' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Our AI platform revolutionizes how businesses operate...' })
  @IsString()
  summary: string;

  @ApiProperty({ example: 'Technology' })
  @IsString()
  industry: string;

  @ApiProperty({ enum: FundingStage, example: FundingStage.EARLY_TRACTION })
  @IsEnum(FundingStage)
  fundingStage: FundingStage;

  @ApiProperty({ example: 'San Francisco, CA', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 'Strong user growth and revenue traction', required: false })
  @IsOptional()
  @IsString()
  traction?: string;

  @ApiProperty({ example: 'Detailed business plan available', required: false })
  @IsOptional()
  @IsString()
  businessPlan?: string;

  @ApiProperty({ example: '/uploads/pitch-deck.pdf', required: false })
  @IsOptional()
  @IsString()
  pitchDeck?: string;

  @ApiProperty({ enum: PitchVisibility, example: PitchVisibility.PUBLIC, required: false })
  @IsOptional()
  @IsEnum(PitchVisibility)
  visibility?: PitchVisibility;
}
