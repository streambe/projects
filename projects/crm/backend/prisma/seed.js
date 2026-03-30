const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with demo data...');

  // =========================================================================
  // USERS (vendedores + admin)
  // =========================================================================

  const passwordHash = await bcrypt.hash('Admin1234!', 12);

  const admin = await upsertUser('admin@ciudadmoto.com', 'Administrador', passwordHash);
  const juan = await upsertUser('juan@ciudadmoto.com', 'Juan Villanueva', passwordHash);
  const maria = await upsertUser('maria@ciudadmoto.com', 'María González', passwordHash);
  const carlos = await upsertUser('carlos@ciudadmoto.com', 'Carlos Méndez', passwordHash);

  console.log('Users created/verified: admin, juan, maria, carlos');
  console.log('Password for all users: Admin1234!');

  // =========================================================================
  // CLIENTS
  // =========================================================================

  const laura = await upsertClient({
    firstName: 'Laura', lastName: 'García', dni: '32111222',
    phonePrimary: '11-4455-6677', email: 'laura.garcia@email.com',
    whatsappNumber: '5491144556677', city: 'CABA', province: 'Buenos Aires',
    howFoundUs: 'instagram', notes: 'Vino por Instagram, interesada en Honda CB 300.',
  });

  const marcos = await upsertClient({
    firstName: 'Marcos', lastName: 'Pérez', dni: '28333444',
    phonePrimary: '11-2233-4455', email: 'marcos.perez@email.com',
    whatsappNumber: '5491122334455', city: 'La Plata', province: 'Buenos Aires',
    howFoundUs: 'referido', notes: 'Referido por un amigo. Quiere Yamaha R3.',
  });

  const diana = await upsertClient({
    firstName: 'Diana', lastName: 'Rossi', dni: '35555666',
    phonePrimary: '11-9988-7766', email: 'diana.rossi@email.com',
    whatsappNumber: '5491199887766', city: 'Córdoba', province: 'Córdoba',
    howFoundUs: 'google', notes: 'Buscó en Google. Primera moto.',
  });

  const sergio = await upsertClient({
    firstName: 'Sergio', lastName: 'Molina', dni: '30777888',
    phonePrimary: '11-5544-3322', email: 'sergio.molina@email.com',
    whatsappNumber: '5491155443322', city: 'Rosario', province: 'Santa Fe',
    howFoundUs: 'visita_directa', notes: 'Pasó por el local Norte. Interesado en Bajaj NS200.',
  });

  const andrea = await upsertClient({
    firstName: 'Andrea', lastName: 'Torres', dni: '33999000',
    phonePrimary: '11-6677-8899', email: 'andrea.torres@email.com',
    whatsappNumber: '5491166778899', city: 'CABA', province: 'Buenos Aires',
    howFoundUs: 'facebook', notes: 'Vio un anuncio en Facebook. Quiere una Honda Wave.',
  });

  const pablo = await upsertClient({
    firstName: 'Pablo', lastName: 'Lima', dni: '29111333',
    phonePrimary: '11-3344-5566', email: 'pablo.lima@email.com',
    whatsappNumber: '5491133445566', city: 'Mendoza', province: 'Mendoza',
    howFoundUs: 'referido', notes: 'Referido. Busca algo para viajar.',
  });

  const sofia = await upsertClient({
    firstName: 'Sofía', lastName: 'Rojas', dni: '36222444',
    phonePrimary: '11-7788-9900', email: 'sofia.rojas@email.com',
    whatsappNumber: '5491177889900', city: 'CABA', province: 'Buenos Aires',
    howFoundUs: 'instagram', notes: 'Contactó por DM de Instagram.',
  });

  const martin = await upsertClient({
    firstName: 'Martín', lastName: 'Álvarez', dni: '31444555',
    phonePrimary: '11-1122-3344', email: 'martin.alvarez@email.com',
    whatsappNumber: '5491111223344', city: 'Quilmes', province: 'Buenos Aires',
    howFoundUs: 'google', notes: 'Buscó presupuestos online.',
  });

  console.log('Clients created/verified: 8 clients');

  // =========================================================================
  // OPPORTUNITIES (pipeline)
  // =========================================================================

  const now = new Date();
  const daysAgo = (n) => new Date(now.getTime() - n * 86400000);
  const daysFromNow = (n) => new Date(now.getTime() + n * 86400000);

  // Consulta
  const opp1 = await upsertOpportunity(diana.id, juan.id, 'Yamaha FZ25', 'consulta');
  const opp2 = await upsertOpportunity(pablo.id, maria.id, 'Honda XR 150', 'consulta');
  const opp3 = await upsertOpportunity(sofia.id, carlos.id, 'KTM Duke 200', 'consulta');

  // Prueba de manejo
  const opp4 = await upsertOpportunity(marcos.id, juan.id, 'Yamaha R3', 'prueba_manejo');
  const opp5 = await upsertOpportunity(andrea.id, maria.id, 'Honda Wave 110', 'prueba_manejo');

  // Presupuesto
  const opp6 = await upsertOpportunity(laura.id, juan.id, 'Honda CB 300', 'presupuesto');
  const opp7 = await upsertOpportunity(martin.id, carlos.id, 'Bajaj Dominar 250', 'presupuesto');

  // Cierre (ganadas y perdidas)
  const opp8 = await upsertOpportunity(sergio.id, maria.id, 'Bajaj NS200', 'cierre', 'ganado');
  const opp9 = await upsertOpportunity(sofia.id, juan.id, 'Honda CB 125', 'cierre', 'perdido', 'Consiguió mejor precio en otro local');

  console.log('Opportunities created/verified: 9 opportunities across all stages');

  // =========================================================================
  // ACTIVITIES
  // =========================================================================

  // Pendientes
  await upsertActivity({
    type: 'llamada', title: 'Llamar a Laura por presupuesto Honda CB 300',
    clientId: laura.id, opportunityId: opp6.id, responsibleUserId: juan.id,
    scheduledAt: daysFromNow(1), dueAt: daysFromNow(2), status: 'pendiente',
  });

  await upsertActivity({
    type: 'reunion', title: 'Reunión con Marcos para prueba de manejo Yamaha R3',
    clientId: marcos.id, opportunityId: opp4.id, responsibleUserId: juan.id,
    scheduledAt: daysFromNow(2), dueAt: daysFromNow(3), status: 'pendiente',
  });

  await upsertActivity({
    type: 'tarea', title: 'Preparar cotización para Martín — Bajaj Dominar 250',
    clientId: martin.id, opportunityId: opp7.id, responsibleUserId: carlos.id,
    scheduledAt: daysFromNow(1), dueAt: daysFromNow(1), status: 'pendiente',
  });

  await upsertActivity({
    type: 'llamada', title: 'Seguimiento Andrea — interés en Honda Wave',
    clientId: andrea.id, opportunityId: opp5.id, responsibleUserId: maria.id,
    scheduledAt: daysFromNow(3), status: 'pendiente',
  });

  // Vencida (genera alerta)
  await upsertActivity({
    type: 'llamada', title: 'Llamar a Diana — consulta Yamaha FZ25',
    clientId: diana.id, opportunityId: opp1.id, responsibleUserId: juan.id,
    scheduledAt: daysAgo(2), dueAt: daysAgo(1), status: 'pendiente',
  });

  // Realizadas
  await upsertActivity({
    type: 'llamada', title: 'Primera llamada a Sergio — interés en Bajaj NS200',
    clientId: sergio.id, opportunityId: opp8.id, responsibleUserId: maria.id,
    scheduledAt: daysAgo(10), status: 'realizada',
    summary: 'Sergio confirmó interés. Viene al local el sábado.',
  });

  await upsertActivity({
    type: 'reunion', title: 'Reunión con Sergio en sucursal Norte',
    clientId: sergio.id, opportunityId: opp8.id, responsibleUserId: maria.id,
    scheduledAt: daysAgo(7), status: 'realizada',
    summary: 'Probó la NS200. Le encantó. Pidió financiación.',
  });

  await upsertActivity({
    type: 'llamada', title: 'Cierre con Sergio — Bajaj NS200',
    clientId: sergio.id, opportunityId: opp8.id, responsibleUserId: maria.id,
    scheduledAt: daysAgo(3), status: 'realizada',
    summary: 'Cerró la compra. Retira el miércoles.',
  });

  await upsertActivity({
    type: 'llamada', title: 'Contacto inicial con Pablo — Honda XR 150',
    clientId: pablo.id, opportunityId: opp2.id, responsibleUserId: maria.id,
    scheduledAt: daysAgo(5), status: 'realizada',
    summary: 'Pablo quiere algo para ruta. Le recomendé la XR 150.',
  });

  await upsertActivity({
    type: 'tarea', title: 'Enviar catálogo a Sofía por email',
    clientId: sofia.id, opportunityId: opp3.id, responsibleUserId: carlos.id,
    scheduledAt: daysAgo(4), status: 'realizada',
    summary: 'Catálogo enviado con precios de KTM Duke 200.',
  });

  console.log('Activities created/verified: 10 activities (5 pending, 5 done)');

  // =========================================================================
  // MESSAGES (comunicaciones simuladas)
  // =========================================================================

  await upsertMessage({
    channel: 'gmail', direction: 'outbound',
    clientId: laura.id, externalId: 'demo-gmail-001',
    fromAddress: 'ciudadmoto@gmail.com', toAddress: 'laura.garcia@email.com',
    subject: 'Presupuesto Honda CB 300 — Ciudad Moto',
    body: 'Hola Laura! Te enviamos el presupuesto de la Honda CB 300 que consultaste. Precio de lista: USD 4.200. Financiación disponible en 12 o 18 cuotas. Quedamos a disposición!',
    sentReceivedAt: daysAgo(3),
  });

  await upsertMessage({
    channel: 'gmail', direction: 'inbound',
    clientId: laura.id, externalId: 'demo-gmail-002',
    fromAddress: 'laura.garcia@email.com', toAddress: 'ciudadmoto@gmail.com',
    subject: 'Re: Presupuesto Honda CB 300 — Ciudad Moto',
    body: 'Hola! Gracias por el presupuesto. Me interesa la financiación en 12 cuotas. ¿Cuál sería el monto de cada cuota? ¿Tienen stock disponible?',
    sentReceivedAt: daysAgo(2),
  });

  await upsertMessage({
    channel: 'whatsapp', direction: 'outbound',
    clientId: marcos.id, externalId: 'demo-wa-001',
    fromAddress: '+5493511112222', toAddress: '5491122334455',
    body: 'Hola Marcos! Soy Juan de Ciudad Moto. Te escribo para confirmar la prueba de manejo de la Yamaha R3 este sábado a las 10hs. ¿Te queda bien?',
    sentReceivedAt: daysAgo(4),
  });

  await upsertMessage({
    channel: 'whatsapp', direction: 'inbound',
    clientId: marcos.id, externalId: 'demo-wa-002',
    fromAddress: '5491122334455', toAddress: '+5493511112222',
    body: 'Dale Juan, perfecto! Ahí estoy el sábado a las 10. Gracias!',
    sentReceivedAt: daysAgo(4),
  });

  await upsertMessage({
    channel: 'whatsapp', direction: 'outbound',
    clientId: sergio.id, externalId: 'demo-wa-003',
    fromAddress: '+5493511112222', toAddress: '5491155443322',
    body: 'Sergio! Te confirmo que tu Bajaj NS200 ya está lista para retirar. Pasá por sucursal Norte con el DNI. Felicitaciones por la compra!',
    sentReceivedAt: daysAgo(1),
  });

  // Mensajes sin vincular (bandeja general)
  await upsertMessage({
    channel: 'gmail', direction: 'inbound',
    clientId: null, externalId: 'demo-gmail-unlinked-001',
    fromAddress: 'consulta.nueva@example.com', toAddress: 'ciudadmoto@gmail.com',
    subject: 'Consulta por Yamaha MT-03',
    body: 'Buenos días, quisiera saber el precio de la Yamaha MT-03. ¿Tienen disponibilidad? Gracias.',
    sentReceivedAt: daysAgo(1),
  });

  await upsertMessage({
    channel: 'whatsapp', direction: 'inbound',
    clientId: null, externalId: 'demo-wa-unlinked-001',
    fromAddress: '5491199998888', toAddress: '+5493511112222',
    body: 'Hola, vi una publicación de ustedes en Instagram. ¿Tienen la Honda CB 125 en rojo?',
    sentReceivedAt: daysAgo(0),
  });

  console.log('Messages created/verified: 7 messages (5 linked, 2 unlinked)');

  console.log('\n========================================');
  console.log('Seed complete! Demo data loaded.');
  console.log('========================================');
  console.log('Users: admin, juan, maria, carlos (password: Admin1234!)');
  console.log('Clients: 8');
  console.log('Opportunities: 9 (3 consulta, 2 prueba, 2 presupuesto, 2 cierre)');
  console.log('Activities: 10 (5 pendientes incl. 1 vencida, 5 realizadas)');
  console.log('Messages: 7 (5 vinculados, 2 en bandeja general)');
  console.log('========================================\n');
}

// ===========================================================================
// Upsert helpers (idempotent)
// ===========================================================================

async function upsertUser(email, fullName, passwordHash) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  return prisma.user.create({ data: { fullName, email, passwordHash, isActive: true } });
}

async function upsertClient(data) {
  const existing = await prisma.client.findUnique({ where: { dni: data.dni } });
  if (existing) return existing;
  return prisma.client.create({ data });
}

async function upsertOpportunity(clientId, assignedUserId, motoInterest, stage, result, lossReason) {
  const existing = await prisma.opportunity.findFirst({
    where: { clientId, motoInterest, stage },
  });
  if (existing) return existing;
  return prisma.opportunity.create({
    data: {
      clientId, assignedUserId, motoInterest, stage,
      ...(result && { result, isOpen: false }),
      ...(lossReason && { lossReason: lossReason }),
    },
  });
}

async function upsertActivity(data) {
  const existing = await prisma.activity.findFirst({
    where: { title: data.title, clientId: data.clientId },
  });
  if (existing) return existing;
  return prisma.activity.create({ data });
}

async function upsertMessage(data) {
  const existing = await prisma.message.findFirst({
    where: { externalId: data.externalId, channel: data.channel },
  });
  if (existing) return existing;
  return prisma.message.create({ data });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
