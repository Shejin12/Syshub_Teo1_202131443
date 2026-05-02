import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, targetType: string, targetId: number, reason: string) {
    return this.prisma.report.create({
      data: {
        reason,
        targetType,
        targetId,
        reporterId: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.report.findMany({
      include: {
        reporter: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: number, status: string) {
    return this.prisma.report.update({
      where: { id },
      data: { status }
    });
  }
}
