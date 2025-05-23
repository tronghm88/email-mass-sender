import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.userRepo.find();
    return users.map((u) => ({ email: u.email, role: u.role }));
  }

  async addUser(email: string) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { message: 'Email không hợp lệ' };
    }
    const existed = await this.userRepo.findOne({ where: { email } });
    if (existed) {
      return { message: 'Email đã tồn tại' };
    }
    const user = this.userRepo.create({ email, role: 'user' });
    await this.userRepo.save(user);
    return { email: user.email, role: user.role };
  }

  async deleteUser(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      return { message: 'Không tìm thấy user' };
    }
    if (user.role === 'admin') {
      return { message: 'Không thể xoá admin' };
    }
    await this.userRepo.delete({ email });
    return { message: 'Đã xoá user' };
  }
}
