import { Module } from '@nestjs/common';
import { AuthsModule } from './auths/auths.module';
import { PrismaModule } from './prisma.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommunitiesModule } from './communities/communities.module';
import { ConfigModule } from '@nestjs/config';
// import { LoggerMiddleware } from './common/logger.middleware';

@Module({
  imports: [
    AuthsModule,
    PrismaModule,
    UsersModule,
    PostsModule,
    CommunitiesModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(LoggerMiddleware).forRoutes('*');
  // }
}
