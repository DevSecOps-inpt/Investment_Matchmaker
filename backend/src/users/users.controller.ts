import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateEntrepreneurProfileDto } from './dto/create-entrepreneur-profile.dto';
import { CreateInvestorProfileDto } from './dto/create-investor-profile.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(user.id, updateUserDto);
  }

  @Post('entrepreneur-profile')
  @ApiOperation({ summary: 'Create entrepreneur profile' })
  @ApiResponse({ status: 201, description: 'Entrepreneur profile created successfully' })
  @ApiResponse({ status: 409, description: 'Profile already exists' })
  async createEntrepreneurProfile(
    @CurrentUser() user: any,
    @Body() profileDto: CreateEntrepreneurProfileDto,
  ) {
    return this.usersService.createEntrepreneurProfile(user.id, profileDto);
  }

  @Put('entrepreneur-profile')
  @ApiOperation({ summary: 'Update entrepreneur profile' })
  @ApiResponse({ status: 200, description: 'Entrepreneur profile updated successfully' })
  async updateEntrepreneurProfile(
    @CurrentUser() user: any,
    @Body() profileDto: Partial<CreateEntrepreneurProfileDto>,
  ) {
    return this.usersService.updateEntrepreneurProfile(user.id, profileDto);
  }

  @Post('investor-profile')
  @ApiOperation({ summary: 'Create investor profile' })
  @ApiResponse({ status: 201, description: 'Investor profile created successfully' })
  @ApiResponse({ status: 409, description: 'Profile already exists' })
  async createInvestorProfile(
    @CurrentUser() user: any,
    @Body() profileDto: CreateInvestorProfileDto,
  ) {
    return this.usersService.createInvestorProfile(user.id, profileDto);
  }

  @Put('investor-profile')
  @ApiOperation({ summary: 'Update investor profile' })
  @ApiResponse({ status: 200, description: 'Investor profile updated successfully' })
  async updateInvestorProfile(
    @CurrentUser() user: any,
    @Body() profileDto: Partial<CreateInvestorProfileDto>,
  ) {
    return this.usersService.updateInvestorProfile(user.id, profileDto);
  }

  @Get('entrepreneurs')
  @ApiOperation({ summary: 'Get list of entrepreneurs' })
  @ApiResponse({ status: 200, description: 'Entrepreneurs retrieved successfully' })
  async getEntrepreneurs(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.usersService.getEntrepreneurs(page, limit);
  }

  @Get('investors')
  @ApiOperation({ summary: 'Get list of investors' })
  @ApiResponse({ status: 200, description: 'Investors retrieved successfully' })
  async getInvestors(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.usersService.getInvestors(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
