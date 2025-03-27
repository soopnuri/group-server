import { Module } from '@nestjs/common';
import { AuthsModule } from './auths/auths.module';
import { PrismaModule } from './prisma.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommunitiesModule } from './communities/communities.module';

@Module({
  imports: [
    AuthsModule,
    PrismaModule,
    UsersModule,
    PostsModule,
    CommunitiesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
