import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import SurveyForm, { type SurveyFormData } from "@/components/survey-form";

export default async function EditSurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getAuthUserId();
  if (!userId) redirect("/login");

  const survey = await prisma.survey.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!survey || survey.userId !== userId) redirect("/surveys");

  const initialData: SurveyFormData = {
    title: survey.title,
    description: survey.description ?? "",
    questions: survey.questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type as "TEXT" | "MULTIPLE_CHOICE" | "SCALE" | "YES_NO",
      isRequired: q.isRequired,
      options: q.options.map((o) => ({ text: o.text, order: o.order })),
    })),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Editar encuesta</h1>
      <SurveyForm initialData={initialData} surveyId={id} />
    </div>
  );
}
