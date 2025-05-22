import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật CORS để frontend có thể gọi API
  app.enableCors();

  // Thêm global prefix cho API
  app.setGlobalPrefix('api');

  // Khởi động server
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
