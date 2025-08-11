import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InvestmentRange } from '@prisma/client';

export class CreateInvestorProfileDto {
  @ApiProperty({ example: ['Technology', 'Healthcare', 'Fintech'] })
  @IsArray()
  @IsString({ each: true })
  investmentFocus: string[];

  @ApiProperty({ enum: InvestmentRange, example: InvestmentRange.FIVE_HUNDRED_K_TO_1M })
  @IsEnum(InvestmentRange)
  investmentRange: InvestmentRange;

  @ApiProperty({ example: ['Company A', 'Company B'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  portfolioCompanies?: string[];

  @ApiProperty({ example: 'Focus on early-stage B2B SaaS companies', required: false })
  @IsOptional()
  @IsString()
  investmentThesis?: string;
}
