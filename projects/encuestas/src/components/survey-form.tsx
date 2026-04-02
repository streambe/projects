"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────

type QuestionType = "TEXT" | "MULTIPLE_CHOICE" | "SCALE" | "YES_NO";

interface QuestionOption {
  text: string;
  order: number;
}

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  isRequired: boolean;
  options: QuestionOption[];
}

export interface SurveyFormData {
  title: string;
  description: string;
  questions: Question[];
}

interface SurveyFormProps {
  initialData?: SurveyFormData;
  surveyId?: string;
}

const TYPE_LABELS: Record<QuestionType, string> = {
  TEXT: "Texto libre",
  MULTIPLE_CHOICE: "Opción múltiple",
  SCALE: "Escala 1-5",
  YES_NO: "Sí / No",
};

let _qid = 0;
function qid() {
  return `q-${Date.now()}-${++_qid}`;
}

// ─── Sortable question card ─────────────────────────────

function SortableQuestion({
  question,
  index,
  onEdit,
  onRemove,
}: {
  question: Question;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 border border-border bg-card px-4 py-3"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        aria-label="Arrastrar para reordenar"
        {...attributes}
        {...listeners}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      </button>

      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {index + 1}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{question.text}</p>
        <p className="text-xs text-muted-foreground">
          {TYPE_LABELS[question.type]}
          {question.isRequired && " · Obligatoria"}
          {question.type === "MULTIPLE_CHOICE" &&
            ` · ${question.options.length} opciones`}
        </p>
      </div>

      <div className="flex shrink-0 gap-1">
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          Editar
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          Eliminar
        </Button>
      </div>
    </Card>
  );
}

// ─── Question editor (inside Sheet) ─────────────────────

function QuestionEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Question;
  onSave: (q: Question) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(initial?.text ?? "");
  const [type, setType] = useState<QuestionType>(initial?.type ?? "TEXT");
  const [isRequired, setIsRequired] = useState(initial?.isRequired ?? false);
  const [options, setOptions] = useState<QuestionOption[]>(
    initial?.options?.length ? initial.options : [
      { text: "", order: 0 },
      { text: "", order: 1 },
    ]
  );
  const [errors, setErrors] = useState<string[]>([]);

  function validate(): boolean {
    const errs: string[] = [];
    if (!text.trim()) errs.push("El texto de la pregunta es requerido.");
    if (type === "MULTIPLE_CHOICE") {
      if (options.length < 2)
        errs.push("Opción múltiple necesita al menos 2 opciones.");
      options.forEach((o, i) => {
        if (!o.text.trim()) errs.push(`La opción ${i + 1} está vacía.`);
      });
    }
    setErrors(errs);
    return errs.length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave({
      id: initial?.id ?? qid(),
      text: text.trim(),
      type,
      isRequired,
      options:
        type === "MULTIPLE_CHOICE"
          ? options.map((o, i) => ({ text: o.text.trim(), order: i }))
          : [],
    });
  }

  function addOption() {
    setOptions((prev) => [...prev, { text: "", order: prev.length }]);
  }

  function removeOption(idx: number) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateOption(idx: number, value: string) {
    setOptions((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, text: value } : o))
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {errors.length > 0 && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {errors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="q-text">Texto de la pregunta</Label>
        <Input
          id="q-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ej: ¿Cómo calificarías nuestro servicio?"
        />
      </div>

      <div className="space-y-2">
        <Label>Tipo de respuesta</Label>
        <RadioGroup
          value={type}
          onValueChange={(v) => setType(v as QuestionType)}
          className="grid grid-cols-2 gap-2"
        >
          {(Object.keys(TYPE_LABELS) as QuestionType[]).map((t) => (
            <Label
              key={t}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
            >
              <RadioGroupItem value={t} />
              {TYPE_LABELS[t]}
            </Label>
          ))}
        </RadioGroup>
      </div>

      {type === "MULTIPLE_CHOICE" && (
        <div className="space-y-2">
          <Label>Opciones</Label>
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={opt.text}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  placeholder={`Opción ${idx + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={options.length <= 2}
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={() => removeOption(idx)}
                >
                  Quitar
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
          >
            + Agregar opción
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Checkbox
          id="q-required"
          checked={isRequired}
          onCheckedChange={(v) => setIsRequired(v === true)}
        />
        <Label htmlFor="q-required" className="cursor-pointer text-sm">
          Obligatoria
        </Label>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleSave}>
          Guardar pregunta
        </Button>
      </div>
    </div>
  );
}

// ─── Main form ──────────────────────────────────────────

export default function SurveyForm({ initialData, surveyId }: SurveyFormProps) {
  const router = useRouter();
  const isEditing = Boolean(surveyId);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions ?? []
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(
    undefined
  );
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      setQuestions((prev) => {
        const oldIdx = prev.findIndex((q) => q.id === active.id);
        const newIdx = prev.findIndex((q) => q.id === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    },
    []
  );

  function openNewQuestion() {
    setEditingQuestion(undefined);
    setSheetOpen(true);
  }

  function openEditQuestion(q: Question) {
    setEditingQuestion(q);
    setSheetOpen(true);
  }

  function handleSaveQuestion(q: Question) {
    setQuestions((prev) => {
      const idx = prev.findIndex((p) => p.id === q.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = q;
        return copy;
      }
      return [...prev, q];
    });
    setSheetOpen(false);
    setEditingQuestion(undefined);
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function validate(): boolean {
    const errs: string[] = [];
    if (!title.trim()) errs.push("El título es requerido.");
    if (questions.length === 0)
      errs.push("Agregá al menos una pregunta.");
    setFormErrors(errs);
    return errs.length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);

    const body = {
      title: title.trim(),
      description: description.trim() || undefined,
      questions: questions.map((q, i) => ({
        text: q.text,
        type: q.type,
        isRequired: q.isRequired,
        order: i,
        options:
          q.type === "MULTIPLE_CHOICE"
            ? q.options.map((o, j) => ({ text: o.text, order: j }))
            : undefined,
      })),
    };

    try {
      const url = isEditing ? `/api/surveys/${surveyId}` : "/api/surveys";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Error al guardar");
      }

      toast.success(isEditing ? "Encuesta actualizada" : "Encuesta creada");
      router.push("/surveys");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {formErrors.length > 0 && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {formErrors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}

      {/* Title & description */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="survey-title">Título *</Label>
          <Input
            id="survey-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nombre de la encuesta"
            maxLength={200}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="survey-desc">Descripción</Label>
          <Textarea
            id="survey-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción opcional"
            rows={3}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-foreground">
            Preguntas ({questions.length})
          </h2>
          <Button type="button" variant="outline" size="sm" onClick={openNewQuestion}>
            + Agregar pregunta
          </Button>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No hay preguntas todavía. Agregá la primera.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={questions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <SortableQuestion
                    key={q.id}
                    question={q}
                    index={i}
                    onEdit={() => openEditQuestion(q)}
                    onRemove={() => removeQuestion(q.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/surveys")}
        >
          Cancelar
        </Button>
        <Button type="button" disabled={saving} onClick={handleSubmit}>
          {saving
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Crear encuesta"}
        </Button>
      </div>

      {/* Question editor sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {editingQuestion ? "Editar pregunta" : "Nueva pregunta"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <QuestionEditor
              key={editingQuestion?.id ?? "new"}
              initial={editingQuestion}
              onSave={handleSaveQuestion}
              onCancel={() => setSheetOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
