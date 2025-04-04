import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('--- Request Received ---');
    console.log('Method:', req.method);
    console.log('URL:', req.originalUrl);
    console.log('Headers:', req.headers);
    // 중요: 요청 본문을 여기서 로깅합니다.
    // body-parser 등이 적용된 후의 상태입니다.
    console.log('Raw Request Body:', req.body);
    console.log('------------------------');
    next(); // 다음 미들웨어 또는 라우트 핸들러로 진행
  }
}
