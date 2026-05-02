import { Controller, Get, Post, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req: any, @Body() body: any) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'AUXILIAR') {
      throw new ForbiddenException('Only Auxiliaries and Admins can post blogs');
    }
    return this.blogsService.create(req.user.userId, body);
  }

  @Get()
  findAll() {
    return this.blogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/comments')
  addComment(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.blogsService.addComment(req.user.userId, +id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/comments/:commentId/reply')
  replyComment(@Request() req: any, @Param('id') id: string, @Param('commentId') commentId: string, @Body() body: any) {
    return this.blogsService.replyComment(req.user.userId, +id, +commentId, body);
  }
}
