// src/auth/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'], // Google로부터 받아올 정보 범위
    });
  }

  // Google 인증 후 호출되는 메소드
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, displayName, emails, photos } = profile;
    const user = {
      googleId: id,
      name: displayName,
      email: emails[0].value,
      image: photos[0].value,
    };

    // 여기서 user 정보를 DB에 저장하거나 조회하는 로직을 추가할 수 있습니다.
    // 예를 들어, AuthService를 주입받아 사용합니다.
    // const savedUser = await this.authService.findOrCreateUser(user);
    // done(null, savedUser); // 성공 시 사용자 정보를 반환

    // 간단한 예시로 사용자 정보를 그대로 반환
    done(null, user);
  }
}
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
