import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const SEED_TEMPLATES = [
  {
    name: "Conexion LinkedIn - Dolor de integracion",
    channel: "LINKEDIN" as const,
    content:
      "Hola {{nombre}}, vi que lideras tecnologia en {{empresa}}. En el sector salud la integracion de sistemas legacy es un desafio constante. Me encantaria conectar y compartir experiencias. Saludos",
    variables: ["nombre", "empresa"],
  },
  {
    name: "Conexion LinkedIn - Cumplimiento normativo",
    channel: "LINKEDIN" as const,
    content:
      "{{nombre}}, desde {{empresa}} seguramente enfrentan desafios de compliance en sistemas de salud. Trabajo con equipos que resuelven exactamente eso. Conectamos?",
    variables: ["nombre", "empresa"],
  },
  {
    name: "Conexion LinkedIn - IA en salud",
    channel: "LINKEDIN" as const,
    content:
      "Hola {{nombre}}, la IA esta transformando el sector salud y desde Streambe ayudamos a empresas como {{empresa}} a implementar soluciones inteligentes. Te interesa conversar?",
    variables: ["nombre", "empresa"],
  },
  {
    name: "Follow-up dia 3",
    channel: "LINKEDIN" as const,
    content:
      "{{nombre}}, gracias por conectar. Vi que {{empresa}} opera en {{industria}} — tenemos casos de exito en digitalizacion de procesos clinicos que podrian interesarte. Tenes 15 min esta semana?",
    variables: ["nombre", "empresa", "industria"],
  },
  {
    name: "Follow-up dia 7",
    channel: "LINKEDIN" as const,
    content:
      "{{nombre}}, queria compartirte un caso reciente donde ayudamos a una empresa de salud a reducir 40% el tiempo de procesamiento con un equipo hibrido. Te resuena algo similar en {{empresa}}?",
    variables: ["nombre", "empresa"],
  },
  {
    name: "InMail Sales Navigator",
    channel: "LINKEDIN" as const,
    content:
      "{{nombre}}, lidero el area de soluciones en Streambe. Ayudamos a empresas de salud como {{empresa}} con equipos de desarrollo hibridos y soluciones de IA. Me gustaria explorar si hay sinergia. Podemos agendar una call de 15 min?",
    variables: ["nombre", "empresa"],
  },
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  console.log("Seeding templates...");

  for (const tpl of SEED_TEMPLATES) {
    const existing = await prisma.template.findFirst({
      where: { name: tpl.name },
    });
    if (existing) {
      console.log(`  Skipping "${tpl.name}" (already exists)`);
      continue;
    }
    await prisma.template.create({ data: tpl });
    console.log(`  Created "${tpl.name}"`);
  }

  console.log("Done.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
