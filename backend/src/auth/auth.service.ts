import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) { }

  async register(data: any) {
    const { email, password, name, roleName = 'ESTUDIANTE' } = data;
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    
    let role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      role = await this.prisma.role.create({ data: { name: roleName } });
    }

    let status = await this.prisma.status.findUnique({ where: { name: 'ACTIVO' } });
    if (!status) {
      status = await this.prisma.status.create({ data: { name: 'ACTIVO' } });
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roleId: role.id,
        statusId: status.id,
      },
      include: { role: true, status: true },
    });

    const payload = { sub: user.id, email: user.email, role: user.role.name, status: user.status.name };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role.name, status: user.status.name },
    };
  }

  async login(data: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: { role: true, status: true },
    });
    
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.status.name === 'ELIMINADO') {
      throw new UnauthorizedException('Account is deleted');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role.name, status: user.status.name };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role.name, status: user.status.name },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If the email exists, a code was sent.' };

    const code = Math.floor(10000 + Math.random() * 90000).toString(); // 5 digits
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 mins expiry

    await this.prisma.recoveryCode.create({
      data: {
        code,
        userId: user.id,
        expiresAt,
      },
    });

    await this.mailerService.sendMail({
      to: email,
      subject: 'Recuperación de contraseña',
      text: `Tu código de recuperación es: ${code}`,
    });

    return { message: 'If the email exists, a code was sent.' };
  }

  async resetPassword(data: any) {
    const { email, code, newPassword } = data;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Invalid request');

    const recoveryCode = await this.prisma.recoveryCode.findFirst({
      where: {
        userId: user.id,
        code,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!recoveryCode) throw new BadRequestException('Invalid or expired code');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Invalidate code (optional: delete all codes for this user)
    await this.prisma.recoveryCode.deleteMany({ where: { userId: user.id } });

    return { message: 'Password updated successfully' };
  }
}
