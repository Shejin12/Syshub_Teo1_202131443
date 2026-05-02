import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { status: true } });
    if (user?.status.name === 'SUSPENDIDO') throw new UnauthorizedException('Usuario suspendido no puede publicar');

    const tagsArray = (data.tags || '').split(',').map((t: string) => t.trim()).filter((t: string) => t);
    const tagRelations: any[] = [];
    for (const tagName of tagsArray) {
      let tag = await this.prisma.tag.findUnique({ where: { name: tagName } });
      if (!tag) {
        tag = await this.prisma.tag.create({ data: { name: tagName } });
      }
      tagRelations.push({ tag: { connect: { id: tag.id } } });
    }

    return this.prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        techStack: data.techStack,
        fileUrl: data.fileUrl,
        category: data.category,
        authorId: userId,
        tags: { create: tagRelations },
      },
    });
  }

  async findAll(q?: string) {
    const includeConfig = { 
      author: { select: { id: true, name: true, email: true, role: true } },
      highlightedBy: { select: { id: true, name: true, role: true } },
      tags: { include: { tag: true } }
    };
    if (q) {
      return this.prisma.project.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { techStack: { contains: q, mode: 'insensitive' } },
            { tags: { some: { tag: { name: { contains: q, mode: 'insensitive' } } } } },
          ],
        },
        include: includeConfig,
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.project.findMany({
      include: includeConfig,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.project.findUnique({
      where: { id },
      include: { 
        author: { select: { id: true, name: true, email: true, role: true } },
        highlightedBy: { select: { id: true, name: true, role: true } },
        tags: { include: { tag: true } },
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

  async highlight(user: any, id: number, isHighlighted: boolean) {
    if (user.role !== 'AUXILIAR' && user.role !== 'ADMIN') {
      throw new UnauthorizedException('Only auxiliaries or admins can highlight projects');
    }
    return this.prisma.project.update({
      where: { id },
      data: { highlightedById: isHighlighted ? user.userId : null },
    });
  }

  async addComment(userId: number, projectId: number, data: { content: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { status: true } });
    if (user?.status.name === 'SUSPENDIDO') throw new UnauthorizedException('Usuario suspendido no puede comentar');
    
    return this.prisma.comment.create({
      data: {
        content: data.content,
        authorId: userId,
        projectId,
      },
    });
  }

  async replyComment(userId: number, projectId: number, commentId: number, data: { content: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { status: true } });
    if (user?.status.name === 'SUSPENDIDO') throw new UnauthorizedException('Usuario suspendido no puede comentar');
    
    return this.prisma.comment.create({
      data: {
        content: data.content,
        authorId: userId,
        projectId,
        parentId: commentId,
      },
    });
  }
}
