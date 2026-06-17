import { defineConfig } from 'prisma/config'
import 'dotenv/config'

// Este archivo es solo para la CLI de Prisma (migraciones, studio, etc.)
// La conexión en runtime usa el adaptador PrismaPg definido en prisma.service.ts
export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})