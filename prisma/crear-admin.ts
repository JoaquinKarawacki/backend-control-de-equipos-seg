import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

// Mismo patrón de conexión que usás en la app (adapter PrismaPg).
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Datos del primer admin. Cambiá estos valores por los reales. ---
  const email = 'admin@seg.com';
  const contrasenaPlana = 'cambiar_esta_contrasena';
  const nombre = 'Admin';
  const apellido = 'SEG';
  // --------------------------------------------------------------------

  // ¿Ya existe? No queremos duplicar ni pisar.
  const existente = await prisma.usuario.findUnique({
    where: { email },
  });

  if (existente) {
    console.log(`Ya existe un usuario con email ${email}. No se crea nada.`);
    return;
  }

  // Hasheamos la contraseña igual que en el login (bcrypt.compare la valida así).
  const hash = await bcrypt.hash(contrasenaPlana, 10);

  const admin = await prisma.usuario.create({
    data: {
      email,
      contrasena: hash,
      nombre,
      apellido,
      rol: 'ADMIN',
      activo: true,
    },
  });

  console.log(`Admin creado: ${admin.email} (id: ${admin.id})`);
  console.log(`Contraseña: ${contrasenaPlana}  ← cambiala después del primer login`);
}

main()
  .catch((e) => {
    console.error('Error creando el admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });