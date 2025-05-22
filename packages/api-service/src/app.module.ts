import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './common/logger.module';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import googleConfig from './config/google.config';

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
    // Các module khác
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
