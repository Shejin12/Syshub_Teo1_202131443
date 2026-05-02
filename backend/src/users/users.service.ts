import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        status: true,
        projects: { include: { tags: { include: { tag: true } } } },
        highlightedProjects: { include: { author: true, tags: { include: { tag: true } } } },
        threads: true,
        comments: { include: { thread: { select: { title: true } } } },
        blogs: true,
      },
    });
  }

  async updateProfile(userId: number, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        bio: data.bio !== undefined ? data.bio : undefined,
      },
      select: { id: true, name: true, email: true, role: true, bio: true },
    });
  }
}
