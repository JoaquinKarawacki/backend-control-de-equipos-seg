import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // El adaptador PrismaPg maneja la conexión a PostgreSQL
    // y reemplaza la URL en el datasource del schema
    const adaptador = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });
    super({ adapter: adaptador });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Base de datos conectada');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}