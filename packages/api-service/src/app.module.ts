import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './common/logger.module';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import googleConfig from './config/google.config';
import { SenderModule } from './senders/sender.module';
import { UsersModule } from './users/users.module';
import { BulkEmailModule } from './bulk-email/bulk-email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [googleConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    LoggerModule,
    AuthModule,
    SenderModule,
    UsersModule,
    BulkEmailModule,
    // Các module khác
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
