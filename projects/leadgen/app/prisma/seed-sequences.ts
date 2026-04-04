import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const SEED_SEQUENCES = [
  {
    name: "Conexión Fría - Sector Salud",
    description:
      "Secuencia de 4 pasos para leads fríos del sector salud. LinkedIn connect + follow-ups + InMail.",
    steps: [
      {
        order: 0,
        channel: "LINKEDIN" as const,
        delayDays: 0,
        templateName: "Conexion LinkedIn - Dolor de integracion",
      },
      {
        order: 1,
        channel: "LINKEDIN" as const,
        delayDays: 3,
        templateName: "Follow-up dia 3",
      },
      {
        order: 2,
        channel: "LINKEDIN" as const,
        delayDays: 7,
        templateName: "Follow-up dia 7",
      },
      {
        order: 3,
        channel: "LINKEDIN" as const,
        delayDays: 14,
        templateName: "InMail Sales Navigator",
      },
    ],
  },
  {
    name: "Re-engagement leads tibios",
    description:
      "Secuencia de 3 pasos para re-activar leads que mostraron interés previo.",
    steps: [
      {
        order: 0,
        channel: "LINKEDIN" as const,
        delayDays: 0,
        templateName: "Conexion LinkedIn - IA en salud",
      },
      {
        order: 1,
        channel: "LINKEDIN" as const,
        delayDays: 5,
        templateName: "Follow-up dia 3",
      },
      {
        order: 2,
        channel: "LINKEDIN" as const,
        delayDays: 10,
        templateName: "InMail Sales Navigator",
      },
    ],
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

  console.log("Seeding sequences...");

  for (const seqDef of SEED_SEQUENCES) {
    const existing = await prisma.sequence.findFirst({
      where: { name: seqDef.name },
    });
    if (existing) {
      console.log(`  Skipping "${seqDef.name}" (already exists)`);
      continue;
    }

    // Resolve template names to IDs
    const stepsData = [];
    for (const stepDef of seqDef.steps) {
      let templateId: string | null = null;
      if (stepDef.templateName) {
        const template = await prisma.template.findFirst({
          where: { name: stepDef.templateName },
        });
        if (template) {
          templateId = template.id;
        } else {
          console.warn(
            `  Warning: Template "${stepDef.templateName}" not found. Step will have no template.`
          );
        }
      }
      stepsData.push({
        order: stepDef.order,
        channel: stepDef.channel,
        delayDays: stepDef.delayDays,
        templateId,
      });
    }

    await prisma.sequence.create({
      data: {
        name: seqDef.name,
        description: seqDef.description,
        isActive: true,
        steps: { create: stepsData },
      },
    });
    console.log(`  Created "${seqDef.name}"`);
  }

  console.log("Done.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
