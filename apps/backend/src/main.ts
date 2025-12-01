import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

  // Allow only your frontend to call the API in production
  app.enableCors({
    origin: frontendUrl,
  });

  await app.listen(port);
  console.log(`Nest app listening on port ${port}`);
}
bootstrap();
