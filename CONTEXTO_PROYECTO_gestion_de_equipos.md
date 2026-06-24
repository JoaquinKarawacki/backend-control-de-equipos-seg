# CONTEXTO COMPLETO — mvp-control-de-equipos-seg

## INFORMACIÓN DEL DESARROLLADOR
- **Nombre:** Joaquín
- **Rol:** Desarrollador sole en SEG Ingeniería (SEGHeliotec Uruguay S.A.)
- **Nivel:** Tercer año ingeniería en sistemas
- **División de trabajo con Claude:**
  - Joaquín escribe el BACK con guía de Claude
  - Claude escribe el FRONT completo
  - Si Joaquín se traba o no sabe cómo hacer algo, Claude lo da directamente
- **Principio guía:** Alta cohesión, bajo acoplamiento
- **Idioma del código:** TODO en español (variables, clases, métodos, archivos, comentarios, rutas API). EXCEPCIÓN: `JwtStrategy` y `JwtGuard` mantienen nombres de clase en inglés por restricción técnica de Passport, pero los archivos se llaman `jwt.estrategia.ts` y `jwt.guardia.ts`

---

## EL PROYECTO

**Nombre:** Sistema de gestión de equipos de medida e instrumentos — SEG Ingeniería

**Problema actual:** La empresa usa un Excel (Equipos.xlsx) para rastrear ~50 instrumentos de medición (Data Loggers, sondas amperimétricas, cámaras termográficas, analizadores, etc.). Se registra quién tiene cada equipo día a día con iniciales de técnicos. Genera pérdidas, calibraciones vencidas, falta de trazabilidad.

**Solución:** Web app deployada en Railway, accesible desde browser (incluyendo celular). NO es app móvil nativa — no hay App Store ni Play Store. Los técnicos escanean QR desde el browser del celular.

**Repo del backend:** `github.com/JoaquinKarawacki/backend-control-de-equipos-seg`
**Ruta local:** `C:\Users\Joaquín\Documents\SEG\mvp-control-de-equipos-seg\backend-control-de-equipos-seg`

---

## STACK TECNOLÓGICO

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| Backend | NestJS + TypeScript | Ya conocido, ecosistema de scheduling para alertas |
| Base de datos | PostgreSQL 16 | Dominio relacional complejo |
| ORM | Prisma 7 | Ya usado en mvp-licencias |
| Auth | JWT + Passport | Estándar, sin estado |
| Storage archivos | Cloudflare R2 | Gratis hasta 10GB, API S3-compatible |
| Email | Resend | SDK Node, 100 emails/día gratis |
| QR | librería `qrcode` npm | Genera PNG en base64 |
| Frontend | Next.js + React + Tailwind | PWA para móvil, scanner QR con `html5-qrcode` |
| Deploy | Railway | Ya usado en otros proyectos |

---

## ARQUITECTURA — CAPAS

```
HTTP Request
     ↓
  Controlador     ← solo HTTP, DTOs, delega
     ↓
  Servicio        ← lógica de negocio, reglas del dominio
     ↓
  Prisma/BD       ← acceso a datos
```

**Módulos:**
```
src/
├── equipos/
├── reservas/
├── calibraciones/
├── movimientos/
│   ├── dto/
│   └── estrategias/
├── alertas/
├── documentos/
├── usuarios/
├── auth/
├── prisma/
└── common/
    ├── decoradores/
    ├── filtros/
    └── guards/
```

---

## PATRONES DE DISEÑO APLICADOS

| Patrón | Dónde | Por qué |
|--------|-------|---------|
| Layered Architecture | Toda la app | Separación de responsabilidades: Controlador → Servicio → Prisma |
| Module Pattern | Cada dominio | Módulos NestJS autocontenidos, alta cohesión |
| Global Module | PrismaModule | PrismaService disponible en toda la app sin reimportar |
| DTO | Todas las entradas HTTP | Validación con class-validator, PartialType para updates |
| Dependency Injection | Toda la app | Servicios inyectados por constructor, nunca instanciados manualmente |
| Strategy | Módulo movimientos | Cada tipo de movimiento es una clase independiente con su lógica encapsulada |
| Registry (Map) | MovimientosServicio | Map<TipoMovimiento, MovimientoEstrategia> resuelve qué estrategia usar sin switch |
| Transaction | Estrategias de movimientos | $transaction garantiza atomicidad: o todo se guarda o nada |
| Factory async | AuthModulo | JwtModule.registerAsync para leer JWT_SECRET en tiempo de arranque |
| Strategy + Guard | Auth | JwtStrategy define validación, JwtGuard la aplica como decorador |

---

## ENTORNO DE DESARROLLO

- **Node:** v24.12.0
- **npm:** 11.6.2
- **NestJS CLI:** 11.0.21
- **Docker:** 29.5.3 (PostgreSQL local en puerto 5433)
- **Container:** `control-equipos-postgres`
- **DB local:** usuario `seg` / password `seg123` / database `control_equipos`
- **Puerto servidor:** 3000
- **Herramienta de pruebas:** Thunder Client (extensión VSCode)

### Usuario de prueba (DB local)
| Campo | Valor |
|-------|-------|
| id | cmqs6vw3i0000asv3ciaqqyr4 |
| email | admin@seg.com |
| contraseña | admin123 |
| rol | ADMIN |

### .env
```env
DATABASE_URL="postgresql://seg:seg123@localhost:5433/control_equipos?schema=public"
JWT_SECRET="cambiar_en_produccion_por_algo_largo_y_random"
JWT_EXPIRA_EN="7d"
PORT=3000
FRONTEND_URL="http://localhost:3001"
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME=""
R2_URL_PUBLICA=""
RESEND_API_KEY=""
EMAIL_REMITENTE="notificaciones@segingenieria.com"
```

### docker-compose.yml
```yaml
services:
  postgres:
    image: postgres:16
    container_name: control-equipos-postgres
    environment:
      POSTGRES_USER: seg
      POSTGRES_PASSWORD: seg123
      POSTGRES_DB: control_equipos
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## PRISMA CONFIG

### prisma/schema.prisma
```prisma
generator client {
  provider     = "prisma-client-js"
  moduleFormat = "cjs"
}

datasource db {
  provider = "postgresql"
}

enum RolUsuario {
  ADMIN
  TECNICO
  SOLO_LECTURA
}

enum EstadoEquipo {
  DISPONIBLE
  RESERVADO
  EN_USO
  EN_CALIBRACION
  FUERA_DE_SERVICIO
  DAÑADO
  EXTRAVIADO
}

enum CriticidadEquipo {
  ALTA
  MEDIA
  BAJA
}

enum EstadoReserva {
  PENDIENTE
  CONFIRMADA
  CANCELADA
  COMPLETADA
}

enum TipoMovimiento {
  RETIRO
  DEVOLUCION
  ENVIO_CALIBRACION
  RETORNO_CALIBRACION
}

enum TipoDocumento {
  CERTIFICADO_CALIBRACION
  FOTO
  MANUAL
  OTRO
}

enum TipoAlerta {
  CALIBRACION_POR_VENCER
  CALIBRACION_VENCIDA
  DEVOLUCION_ATRASADA
  EQUIPO_DAÑADO
  EQUIPO_CRITICO_INDISPONIBLE
}

model Usuario {
  id            String     @id @default(cuid())
  nombre        String
  apellido      String
  email         String     @unique
  contrasena    String
  rol           RolUsuario @default(TECNICO)
  activo        Boolean    @default(true)
  creadoEn      DateTime   @default(now())
  actualizadoEn DateTime   @updatedAt

  reservas                 Reserva[]
  movimientos              MovimientoEquipo[]
  documentosSubidos        Documento[]
  calibracionesRegistradas Calibracion[]

  @@map("usuarios")
}

model Equipo {
  id                     String           @id @default(cuid())
  codigoInterno          String           @unique
  descripcion            String
  marca                  String
  modelo                 String
  numeroDeSerie          String?
  ubicacion              String?
  estado                 EstadoEquipo     @default(DISPONIBLE)
  criticidad             CriticidadEquipo @default(MEDIA)
  observaciones          String?
  fechaUltimaCalibracion DateTime?
  vencimientoCalibracion DateTime?
  creadoEn               DateTime         @default(now())
  actualizadoEn          DateTime         @updatedAt

  reservas      Reserva[]
  movimientos   MovimientoEquipo[]
  calibraciones Calibracion[]
  documentos    Documento[]
  alertas       Alerta[]

  @@map("equipos")
}

model Reserva {
  id            String        @id @default(cuid())
  estado        EstadoReserva @default(PENDIENTE)
  fechaDesde    DateTime
  fechaHasta    DateTime
  proyecto      String?
  observaciones String?
  creadoEn      DateTime      @default(now())
  actualizadoEn DateTime      @updatedAt

  equipoId  String
  equipo    Equipo  @relation(fields: [equipoId], references: [id])
  tecnicoId String
  tecnico   Usuario @relation(fields: [tecnicoId], references: [id])

  movimientos MovimientoEquipo[]

  @@map("reservas")
}

model MovimientoEquipo {
  id               String         @id @default(cuid())
  tipo             TipoMovimiento
  fecha            DateTime       @default(now())
  estadoAnterior   EstadoEquipo
  estadoNuevo      EstadoEquipo
  proyectoAsociado String?
  observaciones    String?
  creadoEn         DateTime       @default(now())

  equipoId  String
  equipo    Equipo   @relation(fields: [equipoId], references: [id])
  tecnicoId String
  tecnico   Usuario  @relation(fields: [tecnicoId], references: [id])
  reservaId String?
  reserva   Reserva? @relation(fields: [reservaId], references: [id])

  @@map("movimientos_equipo")
}

model Calibracion {
  id                String   @id @default(cuid())
  fechaRealizada    DateTime
  fechaVencimiento  DateTime
  laboratorio       String?
  numeroCertificado String?
  observaciones     String?
  anulada           Boolean  @default(false)
  motivoAnulacion   String?
  creadoEn          DateTime @default(now())
  actualizadoEn     DateTime @updatedAt

  equipoId        String
  equipo          Equipo   @relation(fields: [equipoId], references: [id])
  registradaPorId String?
  registradaPor   Usuario? @relation(fields: [registradaPorId], references: [id])

  documentos Documento[]

  @@map("calibraciones")
}

model Documento {
  id          String        @id @default(cuid())
  nombre      String
  tipo        TipoDocumento
  urlArchivo  String
  tamanoBytes Int?
  creadoEn    DateTime      @default(now())

  equipoId      String
  equipo        Equipo       @relation(fields: [equipoId], references: [id])
  calibracionId String?
  calibracion   Calibracion? @relation(fields: [calibracionId], references: [id])
  subidoPorId   String
  subidoPor     Usuario      @relation(fields: [subidoPorId], references: [id])

  @@map("documentos")
}

model Alerta {
  id       String     @id @default(cuid())
  tipo     TipoAlerta
  mensaje  String
  leida    Boolean    @default(false)
  resuelta Boolean    @default(false)
  creadoEn DateTime   @default(now())

  equipoId String
  equipo   Equipo @relation(fields: [equipoId], references: [id])

  @@map("alertas")
}
```

### prisma.config.ts (raíz del proyecto)
```typescript
import { defineConfig } from 'prisma/config'
import 'dotenv/config'

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
```

---

## RUTAS API IMPLEMENTADAS

```
POST   /api/equipos                         → crear equipo
GET    /api/equipos                         → listar (filtros: estado, criticidad, busqueda)
GET    /api/equipos/:id                     → ficha completa con calibraciones y reservas
GET    /api/equipos/:id/qr                  → genera QR en base64
PATCH  /api/equipos/:id                     → actualizar equipo
PATCH  /api/equipos/:id/estado              → cambiar estado

POST   /api/usuarios                        → crear usuario
GET    /api/usuarios                        → listar (protegido con JwtGuard)
GET    /api/usuarios/:id                    → obtener por id
PATCH  /api/usuarios/:id                    → actualizar usuario

POST   /api/auth/login                      → login, devuelve access_token

POST   /api/reservas                        → crear reserva
GET    /api/reservas                        → listar (filtros: equipoId, tecnicoId, estado)
GET    /api/reservas/:id                    → detalle
PATCH  /api/reservas/:id/confirmar          → confirmar reserva
PATCH  /api/reservas/:id/cancelar           → cancelar reserva

POST   /api/calibraciones                   → registrar calibración
GET    /api/calibraciones                   → listar (filtros: equipoId)
GET    /api/calibraciones/:id               → detalle
PATCH  /api/calibraciones/:id/anular        → anular calibración

POST   /api/movimientos                     → registrar movimiento (protegido)
GET    /api/movimientos                     → listar (filtros: equipoId, tecnicoId, tipo)
GET    /api/movimientos/equipo/:equipoId    → historial de un equipo
```

---

## ESTADO DE ETAPAS

| Etapa | Descripción | Estado |
|-------|-------------|--------|
| 1 | Base de datos + Prisma | ✅ Completa |
| 2 | Módulo equipos | ✅ Completa |
| 3 | Módulo usuarios + Auth JWT | ✅ Completa |
| 4 | Reservas y préstamos | ✅ Completa |
| 5 | Calibraciones | ✅ Completa |
| 6 | Movimientos e historial | ✅ Completa |
| 7 | Alertas automáticas | ⏳ Pendiente |
| 8 | Documentos + R2 | ⏳ Pendiente |
| 9 | Frontend (Claude lo hace completo) | ⏳ Pendiente |
| 10 | Deploy Railway | ⏳ Pendiente |

---

## PRÓXIMO PASO — ETAPA 7: ALERTAS AUTOMÁTICAS

El módulo de alertas corre en segundo plano usando `@nestjs/schedule` (cron jobs). No tiene rutas de creación — las alertas se generan automáticamente. Sí tiene rutas de consulta y gestión.

### Tipos de alerta y cuándo se disparan

| Tipo | Cuándo | Frecuencia sugerida |
|------|--------|---------------------|
| `CALIBRACION_POR_VENCER` | `vencimientoCalibracion` está a 30 días o menos | 1 vez por día |
| `CALIBRACION_VENCIDA` | `vencimientoCalibracion` ya pasó | 1 vez por día |
| `DEVOLUCION_ATRASADA` | Equipo en `EN_USO` con reserva cuya `fechaHasta` ya pasó | 1 vez por día |
| `EQUIPO_DAÑADO` | Se dispara al cambiar estado a `DAÑADO` (no es cron) | Evento |
| `EQUIPO_CRITICO_INDISPONIBLE` | Equipo con `criticidad: ALTA` no está en `DISPONIBLE` | 1 vez por día |

### Rutas a implementar
```
GET    /api/alertas                → listar (filtros: tipo, leida, resuelta, equipoId)
PATCH  /api/alertas/:id/leer       → marcar como leída
PATCH  /api/alertas/:id/resolver   → marcar como resuelta
```

### Consideraciones importantes
- Antes de crear una alerta, verificar que no exista ya una activa del mismo tipo para el mismo equipo (evitar duplicados)
- El campo `resuelta` se usa para cerrar alertas que ya no aplican (ej: equipo calibrado → alerta de calibración vencida resuelta)
- Las alertas no se borran — son historial

---

## CONVENCIONES DE NOMBRES

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Clases | PascalCase español | `EquiposServicio`, `CrearReservaDto` |
| Métodos | camelCase español | `crearReserva()`, `verificarDisponibilidad()` |
| Variables | camelCase español | `equipoEncontrado`, `reservasActivas` |
| Archivos | kebab-case español | `crear-reserva.dto.ts`, `reservas.servicio.ts` |
| Tablas DB | snake_case español | `movimientos_equipo`, `calibraciones` |
| Campos DB | camelCase español | `codigoInterno`, `fechaDesde` |
| Rutas API | kebab-case español | `/api/equipos/:id/cambiar-estado` |
| EXCEPCIÓN | Clases Passport | `JwtStrategy`, `JwtGuard` (técnico, no renombrar) |

---

## DEPENDENCIAS INSTALADAS

```json
{
  "dependencies": {
    "@nestjs/config": "",
    "@nestjs/jwt": "",
    "@nestjs/passport": "",
    "@nestjs/schedule": "",
    "@nestjs/mapped-types": "",
    "passport": "",
    "passport-jwt": "",
    "bcrypt": "",
    "qrcode": "",
    "@aws-sdk/client-s3": "",
    "@aws-sdk/s3-request-presigner": "",
    "resend": "",
    "class-validator": "",
    "class-transformer": "",
    "@prisma/client": "",
    "@prisma/adapter-pg": "",
    "pg": ""
  },
  "devDependencies": {
    "prisma": "",
    "@types/passport-jwt": "",
    "@types/bcrypt": "",
    "@types/qrcode": "",
    "@types/multer": "",
    "@types/pg": ""
  }
}
```
