import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ThreadsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { status: true } });
    if (user?.status.name === 'SUSPENDIDO') throw new UnauthorizedException('Usuario suspendido no puede crear hilos');

    return this.prisma.thread.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        authorId: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.thread.findMany({
      include: {
        author: { select: { id: true, name: true, role: true } },
        _count: { select: { comments: true, votes: true } },
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.thread.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, role: true } },
        comments: {
          where: { parentId: null },
          include: { 
            author: { select: { id: true, name: true, role: true } }, 
            votes: true,
            replies: {
              include: {
                author: { select: { id: true, name: true, role: true } },
                votes: true,
              },
              orderBy: { createdAt: 'asc' },
            }
          },
          orderBy: { createdAt: 'asc' },
        },
        votes: true,
      },
    });
  }

  async addComment(userId: number, threadId: number, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { status: true } });
    if (user?.status.name === 'SUSPENDIDO') throw new UnauthorizedException('Usuario suspendido no puede comentar');

    return this.prisma.comment.create({
      data: {
        content: data.content,
        authorId: userId,
        threadId,
        parentId: data.parentId || null,
      },
    });
  }

  async deleteComment(user: any, commentId: number) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return;
    if (user.role !== 'ADMIN' && comment.authorId !== user.userId) {
      throw new UnauthorizedException('No tienes permisos para eliminar este comentario');
    }
    return this.prisma.comment.delete({ where: { id: commentId } });
  }

  async voteThread(userId: number, threadId: number, value: number) {
    const existing = await this.prisma.vote.findUnique({
      where: { userId_threadId: { userId, threadId } },
    });
    if (existing) {
      return this.prisma.vote.update({
        where: { id: existing.id },
        data: { value },
      });
    }
    return this.prisma.vote.create({
      data: {
        value,
        userId,
        threadId,
      },
    });
  }
}
