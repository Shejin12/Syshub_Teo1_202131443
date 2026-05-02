import { Controller, Post, Get, Put, Body, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.reportsService.create(req.user.userId, body.targetType, body.targetId, body.reason);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Request() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.role?.name !== 'ADMIN') {
      throw new UnauthorizedException('Solo los administradores pueden ver reportes');
    }
    return this.reportsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id/status')
  updateStatus(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    if (req.user.role !== 'ADMIN' && req.user.role?.name !== 'ADMIN') {
      throw new UnauthorizedException('Solo los administradores pueden actualizar reportes');
    }
    return this.reportsService.updateStatus(+id, body.status);
  }
}
