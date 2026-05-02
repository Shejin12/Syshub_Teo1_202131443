import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/projects',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    })
  }))
  create(@Request() req: any, @Body() body: any, @UploadedFile() file: Express.Multer.File) {
    if (file) {
      body.fileUrl = `/uploads/projects/${file.filename}`;
    }
    return this.projectsService.create(req.user.userId, body);
  }

  @Get()
  findAll(@Query('q') q: string) {
    return this.projectsService.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id/highlight')
  highlight(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.projectsService.highlight(req.user, +id, body.isHighlighted);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/comments')
  addComment(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.projectsService.addComment(req.user.userId, +id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/comments/:commentId/reply')
  replyComment(@Request() req: any, @Param('id') id: string, @Param('commentId') commentId: string, @Body() body: any) {
    return this.projectsService.replyComment(req.user.userId, +id, +commentId, body);
  }
}
