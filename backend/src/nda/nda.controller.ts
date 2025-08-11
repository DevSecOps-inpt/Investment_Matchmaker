import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { NdaService } from './nda.service';
import { CreateNdaRequestDto } from './dto/create-nda-request.dto';
import { UpdateNdaRequestDto } from './dto/update-nda-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('nda')
@Controller('nda')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NdaController {
  constructor(private readonly ndaService: NdaService) {}

  @Post()
  @ApiOperation({ summary: 'Create an NDA request' })
  @ApiResponse({ status: 201, description: 'NDA request created successfully' })
  @ApiResponse({ status: 409, description: 'NDA request already exists' })
  @ApiResponse({ status: 404, description: 'Recipient or pitch not found' })
  create(@CurrentUser() user: any, @Body() createNdaRequestDto: CreateNdaRequestDto) {
    return this.ndaService.create(user.id, createNdaRequestDto);
  }

  @Get('sent')
  @ApiOperation({ summary: 'Get sent NDA requests' })
  @ApiResponse({ status: 200, description: 'Sent NDA requests retrieved successfully' })
  getSentNdaRequests(
    @CurrentUser() user: any,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.ndaService.findUserNdaRequests(user.id, 'sent', page, limit);
  }

  @Get('received')
  @ApiOperation({ summary: 'Get received NDA requests' })
  @ApiResponse({ status: 200, description: 'Received NDA requests retrieved successfully' })
  getReceivedNdaRequests(
    @CurrentUser() user: any,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.ndaService.findUserNdaRequests(user.id, 'received', page, limit);
  }

  @Get('access/:pitchId')
  @ApiOperation({ summary: 'Check NDA access for a pitch' })
  @ApiResponse({ status: 200, description: 'NDA access status retrieved' })
  checkNdaAccess(@CurrentUser() user: any, @Param('pitchId') pitchId: string) {
    return this.ndaService.checkNdaAccess(user.id, pitchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get NDA request by ID' })
  @ApiResponse({ status: 200, description: 'NDA request retrieved successfully' })
  @ApiResponse({ status: 404, description: 'NDA request not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ndaService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update NDA request status' })
  @ApiResponse({ status: 200, description: 'NDA request status updated successfully' })
  @ApiResponse({ status: 403, description: 'Only the recipient can update NDA request status' })
  @ApiResponse({ status: 404, description: 'NDA request not found' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateNdaRequestDto: UpdateNdaRequestDto,
  ) {
    return this.ndaService.updateStatus(id, user.id, updateNdaRequestDto);
  }
}
