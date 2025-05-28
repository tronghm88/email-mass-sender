import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers() {
    // Lấy tất cả user, chỉ trả về email và role
    return this.usersService.findAll();
  }

  // @UseGuards(JwtAuthGuard)
  @Post()
  async addUser(@Body('email') email: string) {
    // Validate email
    return this.usersService.addUser(email);
  }

  // @UseGuards(JwtAuthGuard)
  @Delete(':email')
  async deleteUser(@Param('email') email: string) {
    return this.usersService.deleteUser(email);
  }
}
