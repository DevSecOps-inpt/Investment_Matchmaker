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

import { ConnectionsService } from './connections.service';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('connections')
@Controller('connections')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a connection request' })
  @ApiResponse({ status: 201, description: 'Connection request created successfully' })
  @ApiResponse({ status: 409, description: 'Connection request already exists' })
  @ApiResponse({ status: 404, description: 'Recipient or pitch not found' })
  create(@CurrentUser() user: any, @Body() createConnectionDto: CreateConnectionDto) {
    return this.connectionsService.create(user.id, createConnectionDto);
  }

  @Get('sent')
  @ApiOperation({ summary: 'Get sent connection requests' })
  @ApiResponse({ status: 200, description: 'Sent connections retrieved successfully' })
  getSentConnections(
    @CurrentUser() user: any,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.connectionsService.findUserConnections(user.id, 'sent', page, limit);
  }

  @Get('received')
  @ApiOperation({ summary: 'Get received connection requests' })
  @ApiResponse({ status: 200, description: 'Received connections retrieved successfully' })
  getReceivedConnections(
    @CurrentUser() user: any,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.connectionsService.findUserConnections(user.id, 'received', page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get connection by ID' })
  @ApiResponse({ status: 200, description: 'Connection retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Connection not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.connectionsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update connection status' })
  @ApiResponse({ status: 200, description: 'Connection status updated successfully' })
  @ApiResponse({ status: 403, description: 'Only the recipient can update connection status' })
  @ApiResponse({ status: 404, description: 'Connection not found' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateConnectionDto: UpdateConnectionDto,
  ) {
    return this.connectionsService.updateStatus(id, user.id, updateConnectionDto);
  }
}
