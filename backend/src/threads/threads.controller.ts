import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('threads')
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.threadsService.create(req.user.userId, body);
  }

  @Get()
  findAll() {
    return this.threadsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.threadsService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/comments')
  addComment(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.threadsService.addComment(req.user.userId, +id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/comments/:commentId/reply')
  replyComment(@Request() req: any, @Param('id') id: string, @Param('commentId') commentId: string, @Body() body: any) {
    body.parentId = +commentId;
    return this.threadsService.addComment(req.user.userId, +id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('comments/:commentId')
  deleteComment(@Request() req: any, @Param('commentId') commentId: string) {
    return this.threadsService.deleteComment(req.user, +commentId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/vote')
  voteThread(@Request() req: any, @Param('id') id: string, @Body() body: { value: number }) {
    return this.threadsService.voteThread(req.user.userId, +id, body.value);
  }
}
