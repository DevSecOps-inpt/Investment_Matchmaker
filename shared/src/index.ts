// User and Authentication Types
export enum UserRole {
  ENTREPRENEUR = 'entrepreneur',
  INVESTOR = 'investor',
  ADMIN = 'admin'
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  VERIFIED = 'verified'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedinUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Entrepreneur extends User {
  role: UserRole.ENTREPRENEUR;
  companyName: string;
  industry: string;
  fundingStage: FundingStage;
  fundingAmount?: number;
  equityOffered?: number;
  teamSize: number;
  foundedYear?: number;
}

export interface Investor extends User {
  role: UserRole.INVESTOR;
  investmentFocus: string[];
  investmentRange: InvestmentRange;
  portfolioCompanies?: string[];
  investmentThesis?: string;
  verificationStatus: boolean;
}

// Pitch and Investment Types
export enum FundingStage {
  IDEA = 'idea',
  MVP = 'mvp',
  EARLY_TRACTION = 'early_traction',
  GROWTH = 'growth',
  SCALE = 'scale',
  EXIT = 'exit'
}

export enum InvestmentRange {
  UNDER_100K = 'under_100k',
  HUNDRED_K_TO_500K = '100k_to_500k',
  FIVE_HUNDRED_K_TO_1M = '500k_to_1m',
  ONE_M_TO_5M = '1m_to_5m',
  FIVE_M_TO_10M = '5m_to_10m',
  OVER_10M = 'over_10m'
}

export enum PitchVisibility {
  PUBLIC = 'public',
  VERIFIED_INVESTORS = 'verified_investors',
  BY_REQUEST = 'by_request'
}

export interface Pitch {
  id: string;
  entrepreneurId: string;
  title: string;
  description: string;
  industry: string;
  fundingStage: FundingStage;
  fundingAmount: number;
  equityOffered: number;
  businessPlan: string;
  traction: string;
  teamSize: number;
  foundedYear?: number;
  location: string;
  visibility: PitchVisibility;
  attachments: PitchAttachment[];
  tags: string[];
  status: 'active' | 'funded' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface PitchAttachment {
  id: string;
  type: 'pdf' | 'image' | 'video';
  url: string;
  filename: string;
  size: number;
  uploadedAt: Date;
}

// Chat and Messaging Types
export interface ChatRoom {
  id: string;
  participants: string[];
  pitchId?: string;
  type: 'direct' | 'pitch_discussion';
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: 'text' | 'file' | 'nda_request';
  attachments?: MessageAttachment[];
  readBy: string[];
  createdAt: Date;
}

export interface MessageAttachment {
  id: string;
  type: 'file' | 'image' | 'document';
  url: string;
  filename: string;
  size: number;
}

// Connection and Request Types
export enum ConnectionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  BLOCKED = 'blocked'
}

export interface Connection {
  id: string;
  requesterId: string;
  recipientId: string;
  pitchId?: string;
  message?: string;
  status: ConnectionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface NDARequest {
  id: string;
  requesterId: string;
  recipientId: string;
  pitchId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Search and Filter Types
export interface SearchFilters {
  industry?: string[];
  fundingStage?: FundingStage[];
  fundingAmount?: {
    min?: number;
    max?: number;
  };
  location?: string[];
  tags?: string[];
  teamSize?: {
    min?: number;
    max?: number;
  };
  foundedYear?: {
    min?: number;
    max?: number;
  };
}

export interface SearchResult {
  pitches: Pitch[];
  total: number;
  page: number;
  limit: number;
}

// Notification Types
export enum NotificationType {
  NEW_MESSAGE = 'new_message',
  CONNECTION_REQUEST = 'connection_request',
  NDA_REQUEST = 'nda_request',
  PITCH_VIEW = 'pitch_view',
  SYSTEM_UPDATE = 'system_update'
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'joinRoom' | 'leaveRoom' | 'sendMessage' | 'typing' | 'readReceipt';
  roomId?: string;
  senderId?: string;
  content?: string;
  data?: any;
}

// File Upload Types
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Analytics Types
export interface PlatformAnalytics {
  totalUsers: number;
  totalPitches: number;
  totalConnections: number;
  totalMessages: number;
  activeUsers: number;
  conversionRate: number;
  topIndustries: Array<{ industry: string; count: number }>;
  fundingDistribution: Array<{ stage: FundingStage; count: number }>;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
