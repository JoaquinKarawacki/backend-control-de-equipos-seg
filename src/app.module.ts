import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // ConfigModule global → process.env disponible en toda la app
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}