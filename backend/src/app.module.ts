import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PitchesModule } from './pitches/pitches.module';
import { ChatModule } from './chat/chat.module';
import { ConnectionsModule } from './connections/connections.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from './upload/upload.module';
import { SearchModule } from './search/search.module';
import { NdaModule } from './nda/nda.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 5,
      },
      {
        name: 'messages',
        ttl: 60000,
        limit: 50,
      },
    ]),
    TerminusModule,
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    PitchesModule,
    ChatModule,
    ConnectionsModule,
    NotificationsModule,
    AdminModule,
    UploadModule,
    SearchModule,
    NdaModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
})
export class AppModule {}
