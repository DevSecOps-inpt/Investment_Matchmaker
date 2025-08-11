import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateDirectChatDto, CreatePitchChatDto, SendMessageDto } from './dto';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('direct')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a direct chat room between two users' })
  @ApiResponse({ status: 201, description: 'Chat room created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createDirectChat(
    @Body() createDirectChatDto: CreateDirectChatDto,
    @Request() req,
  ) {
    const { userId2 } = createDirectChatDto;
    const userId1 = req.user.id;
    
    return this.chatService.createDirectChatRoom(userId1, userId2);
  }

  @Post('pitch-discussion')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a pitch discussion chat room' })
  @ApiResponse({ status: 201, description: 'Chat room created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPitchDiscussionChat(
    @Body() createPitchChatDto: CreatePitchChatDto,
    @Request() req,
  ) {
    const { pitchId, investorId } = createPitchChatDto;
    const entrepreneurId = req.user.id;
    
    return this.chatService.createPitchDiscussionRoom(pitchId, entrepreneurId, investorId);
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Get user chat rooms' })
  @ApiResponse({ status: 200, description: 'Chat rooms retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserChatRooms(@Request() req) {
    const userId = req.user.id;
    return this.chatService.getUserChatRooms(userId);
  }

  @Get('rooms/:roomId')
  @ApiOperation({ summary: 'Get chat room by ID' })
  @ApiResponse({ status: 200, description: 'Chat room retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  async getChatRoom(@Param('roomId') roomId: string, @Request() req) {
    const userId = req.user.id;
    return this.chatService.getChatRoomById(roomId, userId);
  }

  @Get('rooms/:roomId/messages')
  @ApiOperation({ summary: 'Get chat room messages' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getChatRoomMessages(
    @Param('roomId') roomId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Request() req,
  ) {
    const userId = req.user.id;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    return this.chatService.getChatRoomMessages(roomId, userId, pageNum, limitNum);
  }

  @Post('rooms/:roomId/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message to a chat room' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async sendMessage(
    @Param('roomId') roomId: string,
    @Body() sendMessageDto: SendMessageDto,
    @Request() req,
  ) {
    const { content, type } = sendMessageDto;
    const senderId = req.user.id;
    
    return this.chatService.sendMessage(roomId, senderId, content, type);
  }

  @Post('messages/:messageId/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markMessageAsRead(
    @Param('messageId') messageId: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    await this.chatService.markMessageAsRead(messageId, userId);
    return { message: 'Message marked as read' };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count for user' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUnreadMessageCount(@Request() req) {
    const userId = req.user.id;
    const count = await this.chatService.getUnreadMessageCount(userId);
    return { unreadCount: count };
  }

  @Post('messages/:messageId/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    await this.chatService.deleteMessage(messageId, userId);
    return { message: 'Message deleted successfully' };
  }
}
