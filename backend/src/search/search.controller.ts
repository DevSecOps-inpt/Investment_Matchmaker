import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { SearchService } from './search.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('pitches')
  @ApiOperation({ summary: 'Search pitches' })
  @ApiResponse({ status: 200, description: 'Pitches search results' })
  searchPitches(
    @Query('q') query: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @CurrentUser() user?: any,
  ) {
    return this.searchService.searchPitches(query, user?.id, page, limit);
  }

  @Get('users')
  @ApiOperation({ summary: 'Search users' })
  @ApiResponse({ status: 200, description: 'Users search results' })
  searchUsers(
    @Query('q') query: string,
    @Query('role') role?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.searchService.searchUsers(query, role, page, limit);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiResponse({ status: 200, description: 'Search suggestions' })
  getSuggestions(
    @Query('q') query: string,
    @Query('type') type: 'pitches' | 'users' = 'pitches',
  ) {
    return this.searchService.getSearchSuggestions(query, type);
  }
}
