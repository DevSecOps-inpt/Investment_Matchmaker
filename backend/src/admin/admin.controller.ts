import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getDashboardStats(@CurrentUser() user: any) {
    return this.adminService.getDashboardStats(user.id);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getUsers(
    @CurrentUser() user: any,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('status') status?: string,
  ) {
    return this.adminService.getUsers(user.id, page, limit, status);
  }

  @Get('pitches')
  @ApiOperation({ summary: 'Get all pitches (admin only)' })
  @ApiResponse({ status: 200, description: 'Pitches retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getPitches(
    @CurrentUser() user: any,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean,
  ) {
    return this.adminService.getPitches(user.id, page, limit, isActive);
  }

  @Patch('users/:userId/verify')
  @ApiOperation({ summary: 'Verify user (admin only)' })
  @ApiResponse({ status: 200, description: 'User verified successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  verifyUser(@CurrentUser() user: any, @Param('userId') userId: string) {
    return this.adminService.verifyUser(user.id, userId);
  }

  @Patch('users/:userId/suspend')
  @ApiOperation({ summary: 'Suspend user (admin only)' })
  @ApiResponse({ status: 200, description: 'User suspended successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  suspendUser(@CurrentUser() user: any, @Param('userId') userId: string) {
    return this.adminService.suspendUser(user.id, userId);
  }

  @Patch('entrepreneurs/:entrepreneurId/verify')
  @ApiOperation({ summary: 'Verify entrepreneur (admin only)' })
  @ApiResponse({ status: 200, description: 'Entrepreneur verified successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Entrepreneur not found' })
  verifyEntrepreneur(@CurrentUser() user: any, @Param('entrepreneurId') entrepreneurId: string) {
    return this.adminService.verifyEntrepreneur(user.id, entrepreneurId);
  }

  @Patch('investors/:investorId/verify')
  @ApiOperation({ summary: 'Verify investor (admin only)' })
  @ApiResponse({ status: 200, description: 'Investor verified successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Investor not found' })
  verifyInvestor(@CurrentUser() user: any, @Param('investorId') investorId: string) {
    return this.adminService.verifyInvestor(user.id, investorId);
  }

  @Patch('pitches/:pitchId/deactivate')
  @ApiOperation({ summary: 'Deactivate pitch (admin only)' })
  @ApiResponse({ status: 200, description: 'Pitch deactivated successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Pitch not found' })
  deactivatePitch(@CurrentUser() user: any, @Param('pitchId') pitchId: string) {
    return this.adminService.deactivatePitch(user.id, pitchId);
  }
}
