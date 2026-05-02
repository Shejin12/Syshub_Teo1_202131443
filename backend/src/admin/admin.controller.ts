import { Controller, Get, Put, Delete, Post, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private checkAdmin(user: any) {
    if (user.role !== 'ADMIN') throw new ForbiddenException('Admin access required');
  }

  @Get('users')
  getUsers(@Request() req: any) {
    this.checkAdmin(req.user);
    return this.adminService.getUsers();
  }

  @Post('users')
  createUser(@Request() req: any, @Body() body: any) {
    this.checkAdmin(req.user);
    return this.adminService.createUser(body);
  }

  @Put('users/:id/role')
  updateUserRole(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    this.checkAdmin(req.user);
    return this.adminService.updateUserRole(+id, body.role);
  }

  @Put('users/:id/status')
  updateUserStatus(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    this.checkAdmin(req.user);
    return this.adminService.updateUserStatus(+id, body.status);
  }

  @Delete('users/:id')
  deleteUser(@Request() req: any, @Param('id') id: string) {
    this.checkAdmin(req.user);
    return this.adminService.deleteUser(+id);
  }

  @Delete('threads/:id')
  deleteThread(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'AUXILIAR') {
      throw new ForbiddenException('Moderator access required');
    }
    return this.adminService.deleteThread(+id);
  }
}
