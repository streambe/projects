"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Option {
  id: string;
  text: string;
  order: number;
}

interface Question {
  id: string;
  text: string;
  type: "SCALE" | "TEXT" | "YES_NO" | "MULTIPLE_CHOICE";
  isRequired: boolean;
  order: number;
  options: Option[];
}

interface Survey {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  questions: Question[];
}

type PageState = "loading" | "form" | "thanks" | "not-found";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PublicSurveyPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [pageState, setPageState] = useState<PageState>("loading");
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  // --- Fetch survey ---
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    fetch(`/api/public/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data: Survey) => {
        if (cancelled) return;
        setSurvey(data);
        setPageState("form");
      })
      .catch(() => {
        if (!cancelled) setPageState("not-found");
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // --- Progress ---
  const requiredIds = useMemo(
    () => survey?.questions.filter((q) => q.isRequired).map((q) => q.id) ?? [],
    [survey]
  );

  const progress = useMemo(() => {
    if (requiredIds.length === 0) return 100;
    const answered = requiredIds.filter(
      (id) => answers[id] !== undefined && answers[id] !== ""
    ).length;
    return Math.round((answered / requiredIds.length) * 100);
  }, [requiredIds, answers]);

  // --- Handlers ---
  const setAnswer = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => {
      if (!prev[questionId]) return prev;
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!survey) return;

    // Validate required
    const newErrors: Record<string, boolean> = {};
    for (const q of survey.questions) {
      if (q.isRequired && (!answers[q.id] || answers[q.id].trim() === "")) {
        newErrors[q.id] = true;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const firstErrorId = survey.questions.find((q) => newErrors[q.id])?.id;
      if (firstErrorId) {
        document
          .getElementById(`q-${firstErrorId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value,
        })),
      };

      const res = await fetch(`/api/public/${slug}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Error al enviar");
      }

      setPageState("thanks");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al enviar las respuestas"
      );
    } finally {
      setSubmitting(false);
    }
  }, [survey, answers, slug]);

  // ---------------------------------------------------------------------------
  // Renders
  // ---------------------------------------------------------------------------

  if (pageState === "loading") {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          <p className="text-sm text-gray-400">Cargando encuesta...</p>
        </div>
      </Shell>
    );
  }

  if (pageState === "not-found") {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="size-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">
            Esta encuesta no est&aacute; disponible
          </h1>
          <p className="text-sm text-gray-500">
            Es posible que haya sido desactivada o el enlace sea incorrecto.
          </p>
        </div>
      </Shell>
    );
  }

  if (pageState === "thanks") {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="size-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">
            {"\u00A1"}Gracias por responder!
          </h1>
          <p className="text-sm text-gray-500">
            Tu opini{"o\u0301"}n fue enviada correctamente.
          </p>
        </div>
      </Shell>
    );
  }

  // --- Form ---
  return (
    <Shell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {survey!.title}
        </h1>
        {survey!.description && (
          <p className="mt-2 text-base text-gray-500">{survey!.description}</p>
        )}
      </div>

      {/* Progress */}
      <div className="mb-8">
        <Progress value={progress}>
          <ProgressLabel className="text-xs text-gray-500">
            Progreso
          </ProgressLabel>
          <ProgressValue className="text-xs text-gray-500" />
        </Progress>
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-8">
        {survey!.questions.map((q, idx) => (
          <div key={q.id} id={`q-${q.id}`}>
            <QuestionField
              question={q}
              index={idx + 1}
              value={answers[q.id] ?? ""}
              error={!!errors[q.id]}
              onChange={(v) => setAnswer(q.id, v)}
            />
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="mt-10">
        <Button
          className="w-full py-3 text-base font-semibold"
          size="lg"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Enviando..." : "Enviar respuestas"}
        </Button>
      </div>
    </Shell>
  );
}

// ---------------------------------------------------------------------------
// Shell — layout wrapper with branding
// ---------------------------------------------------------------------------

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Logo */}
      <header className="border-b border-gray-100 px-6 py-4">
        <p className="text-center text-sm font-semibold tracking-wide text-gray-700">
          Encuestas Streambe
        </p>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-[640px] flex-1 px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-4">
        <p className="text-center text-xs text-gray-400">
          Powered by Streambe
        </p>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// QuestionField — renders the correct input per question type
// ---------------------------------------------------------------------------

function QuestionField({
  question,
  index,
  value,
  error,
  onChange,
}: {
  question: Question;
  index: number;
  value: string;
  error: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-base font-medium text-gray-800">
        <span className="mr-1 text-gray-400">{index}.</span>
        {question.text}
        {question.isRequired && (
          <span className="ml-0.5 text-red-500" aria-label="obligatoria">
            *
          </span>
        )}
      </legend>

      {question.type === "SCALE" && (
        <ScaleInput value={value} onChange={onChange} />
      )}

      {question.type === "TEXT" && (
        <Textarea
          placeholder="Escrib\u00ed tu respuesta..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[100px] resize-y text-base"
          aria-invalid={error || undefined}
        />
      )}

      {question.type === "YES_NO" && (
        <RadioGroup value={value} onValueChange={onChange} className="flex gap-4">
          {[
            { val: "yes", label: "S\u00ed" },
            { val: "no", label: "No" },
          ].map((opt) => (
            <Label
              key={opt.val}
              className="flex cursor-pointer items-center gap-2 text-base text-gray-700"
            >
              <RadioGroupItem value={opt.val} />
              {opt.label}
            </Label>
          ))}
        </RadioGroup>
      )}

      {question.type === "MULTIPLE_CHOICE" && (
        <RadioGroup value={value} onValueChange={onChange}>
          {question.options.map((opt) => (
            <Label
              key={opt.id}
              className="flex cursor-pointer items-center gap-2 text-base text-gray-700"
            >
              <RadioGroupItem value={opt.id} />
              {opt.text}
            </Label>
          ))}
        </RadioGroup>
      )}

      {error && (
        <p className="text-sm text-red-500" role="alert">
          Esta pregunta es obligatoria
        </p>
      )}
    </fieldset>
  );
}

// ---------------------------------------------------------------------------
// ScaleInput — 1-5 buttons in a row
// ---------------------------------------------------------------------------

function ScaleInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const scales = ["1", "2", "3", "4", "5"];

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="flex gap-2"
        role="radiogroup"
        aria-label="Escala del 1 al 5"
      >
        {scales.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            onClick={() => onChange(n)}
            className={`flex size-11 items-center justify-center rounded-lg border text-base font-medium transition-colors ${
              value === n
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-gray-400">Mala</span>
        <span className="text-xs text-gray-400">Excelente</span>
      </div>
    </div>
  );
}
