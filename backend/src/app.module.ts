import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { ThreadsModule } from './threads/threads.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { BlogsModule } from './blogs/blogs.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProjectsModule,
    ThreadsModule,
    UsersModule,
    AdminModule,
    BlogsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads/',
      serveStaticOptions: {
        setHeaders: (res) => {
          res.set('Content-Disposition', 'attachment');
        }
      }
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.zoho.com',
        port: 465,
        secure: true, // true para puerto 465
        auth: {
          user: 'sergiorod@zohomail.com',
          pass: 'hPMYDaqTbyYU',
        },
      },
      defaults: {
        from: '"Sistema NestJS" <sergiorod@zohomail.com>',
      },
    }),
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
