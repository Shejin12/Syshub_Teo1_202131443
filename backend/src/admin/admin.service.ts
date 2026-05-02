import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}

  async getUsers() {
    return this.prisma.user.findMany({
      include: { role: true, status: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUser(data: any) {
    let role = await this.prisma.role.findUnique({ where: { name: data.roleName } });
    if (!role) {
      role = await this.prisma.role.create({ data: { name: data.roleName } });
    }
    let status = await this.prisma.status.findUnique({ where: { name: 'ACTIVO' } });
    if (!status) {
      status = await this.prisma.status.create({ data: { name: 'ACTIVO' } });
    }
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        roleId: role.id,
        statusId: status.id,
      },
      include: { role: true, status: true },
    });
  }

  async updateUserRole(id: number, roleName: string) {
    let role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      role = await this.prisma.role.create({ data: { name: roleName } });
    }
    return this.prisma.user.update({
      where: { id },
      data: { roleId: role.id },
      include: { role: true, status: true },
    });
  }

  async updateUserStatus(id: number, statusName: string) {
    let status = await this.prisma.status.findUnique({ where: { name: statusName } });
    if (!status) {
      status = await this.prisma.status.create({ data: { name: statusName } });
    }
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { statusId: status.id },
      include: { role: true, status: true },
    });

    try {
      await this.mailerService.sendMail({
        to: updatedUser.email,
        subject: 'Actualización de estado en SysHub',
        text: `Hola ${updatedUser.name}, tu estado en la plataforma ha sido actualizado a: ${statusName}.`,
      });
    } catch (e) {
      console.error('Failed to send email', e);
    }

    return updatedUser;
  }

  async deleteUser(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async deleteThread(id: number) {
    return this.prisma.thread.delete({ where: { id } });
  }
}
