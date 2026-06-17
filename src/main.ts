import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  // Validación automática de DTOs
  // whitelist: true → descarta campos que no están en el DTO (seguridad)
  // forbidNonWhitelisted: true → lanza error si llega un campo extra
  // transform: true → convierte tipos automáticamente (string "123" → number 123)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS abierto por ahora para desarrollo local
  // En producción esto se restringe al dominio del frontend
  app.enableCors();

  const puerto = process.env.PORT ?? 3000;
  await app.listen(puerto);

  console.log(`Servidor corriendo en http://localhost:${puerto}/api`);
}

bootstrap();