import SurveyForm from "@/components/survey-form";

export default function NewSurveyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Nueva encuesta</h1>
      <SurveyForm />
    </div>
  );
}
