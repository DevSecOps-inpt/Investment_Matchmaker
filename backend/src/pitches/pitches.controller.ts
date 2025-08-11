import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { PitchesService } from './pitches.service';
import { CreatePitchDto } from './dto/create-pitch.dto';
import { UpdatePitchDto } from './dto/update-pitch.dto';
import { SearchPitchesDto } from './dto/search-pitches.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('pitches')
@Controller('pitches')
export class PitchesController {
  constructor(private readonly pitchesService: PitchesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new pitch' })
  @ApiResponse({ status: 201, description: 'Pitch created successfully' })
  @ApiResponse({ status: 403, description: 'Only entrepreneurs can create pitches' })
  create(@CurrentUser() user: any, @Body() createPitchDto: CreatePitchDto) {
    return this.pitchesService.create(user.id, createPitchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Search and filter pitches' })
  @ApiResponse({ status: 200, description: 'Pitches retrieved successfully' })
  findAll(@Query() searchDto: SearchPitchesDto, @CurrentUser() user?: any) {
    return this.pitchesService.findAll(searchDto, user?.id);
  }

  @Get('my-pitches')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user pitches' })
  @ApiResponse({ status: 200, description: 'User pitches retrieved successfully' })
  getUserPitches(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.pitchesService.getUserPitches(user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pitch by ID' })
  @ApiResponse({ status: 200, description: 'Pitch retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Pitch not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.pitchesService.findOne(id, user?.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update pitch' })
  @ApiResponse({ status: 200, description: 'Pitch updated successfully' })
  @ApiResponse({ status: 403, description: 'You can only update your own pitches' })
  @ApiResponse({ status: 404, description: 'Pitch not found' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updatePitchDto: UpdatePitchDto,
  ) {
    return this.pitchesService.update(id, user.id, updatePitchDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete pitch' })
  @ApiResponse({ status: 200, description: 'Pitch deleted successfully' })
  @ApiResponse({ status: 403, description: 'You can only delete your own pitches' })
  @ApiResponse({ status: 404, description: 'Pitch not found' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.pitchesService.remove(id, user.id);
  }
}
