import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(new ValidationPipe());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Day 4 - Blockchain Backend API')
    .setDescription(
      'Backend API for reading Avalanche Smart Contract data\n\n' +
        'Nama: Muhammad Fikri Rezandi\n\n' +
        'NIM: 231011402149',
    )
    .setVersion('1.0')
    .addTag('blockchain')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Enable CORS for frontend
  app.enableCors();

  const port = process.env.PORT ?? 3002;
  await app.listen(port);
  console.log(`🚀 Backend running at http://localhost:${port}`);
  console.log(`📄 Swagger docs at http://localhost:${port}/api`);
}
void bootstrap();
