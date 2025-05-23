import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './user.entity';

@Injectable()
export class UserSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (!adminEmail) {
      Logger.warn('ADMIN_EMAIL is not set in environment variables');
      return;
    }
    const existed = await this.userRepo.findOne({
      where: { email: adminEmail },
    });
    if (!existed) {
      await this.userRepo.save({ email: adminEmail, role: 'admin' });
      Logger.log(`Seeded admin user: ${adminEmail}`);
    } else {
      Logger.log(`Admin user already exists: ${adminEmail}`);
    }
  }
}
