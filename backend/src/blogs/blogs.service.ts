import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: any) {
    return this.prisma.blog.create({
      data: {
        title: data.title,
        content: data.content,
        authorId: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.blog.findMany({
      include: { author: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.blog.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, role: true } },
        comments: {
          where: { parentId: null },
          include: {
            author: { select: { id: true, name: true, role: true } },
            replies: { include: { author: { select: { id: true, name: true, role: true } } } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
    });
  }

  async addComment(userId: number, blogId: number, data: { content: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { status: true } });
    if (user?.status.name === 'SUSPENDIDO') throw new Error('Usuario suspendido no puede comentar');
    
    return this.prisma.comment.create({
      data: {
        content: data.content,
        authorId: userId,
        blogId,
      },
    });
  }

  async replyComment(userId: number, blogId: number, commentId: number, data: { content: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { status: true } });
    if (user?.status.name === 'SUSPENDIDO') throw new Error('Usuario suspendido no puede comentar');
    
    return this.prisma.comment.create({
      data: {
        content: data.content,
        authorId: userId,
        blogId,
        parentId: commentId,
      },
    });
  }
}
