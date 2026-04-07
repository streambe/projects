"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, LogOut, Hand, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClaimButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      onClick={() =>
        startTransition(async () => {
          const res = await fetch(`/api/projects/${projectId}/claim`, { method: "POST" });
          const json = await res.json().catch(() => ({}));
          if (res.ok) {
            if (json.queued) {
              toast.info(json.message ?? `En cola, posición ${json.position}`);
            } else {
              toast.success("Proyecto tomado");
            }
            router.refresh();
          } else {
            toast.error(json.error ?? "Error");
          }
        })
      }
      disabled={pending}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Hand className="h-4 w-4" />}
      Tomar
    </Button>
  );
}

export function ReleaseButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      onClick={() => {
        if (!confirm("¿Liberar el proyecto?")) return;
        startTransition(async () => {
          const res = await fetch(`/api/projects/${projectId}/release`, { method: "POST" });
          const json = await res.json().catch(() => ({}));
          if (res.ok) {
            toast.success("Proyecto liberado");
            router.refresh();
          } else {
            toast.error(json.error ?? "Error");
          }
        });
      }}
      disabled={pending}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Liberar
    </Button>
  );
}

export function UploadFilesButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(fileList).forEach((f) => fd.append("files", f));
    const res = await fetch(`/api/projects/${projectId}/files`, {
      method: "POST",
      body: fd,
    });
    setUploading(false);
    if (res.ok) {
      toast.success("Archivos subidos");
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error ?? "Error al subir");
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        Subir archivos
      </Button>
    </>
  );
}

export function DeleteFileButton({
  projectId,
  fileId,
}: {
  projectId: string;
  fileId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="icon"
      variant="ghost"
      disabled={pending}
      onClick={() => {
        if (!confirm("¿Eliminar archivo?")) return;
        startTransition(async () => {
          const res = await fetch(
            `/api/projects/${projectId}/files/${fileId}`,
            { method: "DELETE" },
          );
          if (res.ok) {
            toast.success("Archivo eliminado");
            router.refresh();
          } else {
            const json = await res.json().catch(() => ({}));
            toast.error(json.error ?? "Error");
          }
        });
      }}
    >
      <Trash2 className="h-3.5 w-3.5 text-destructive" />
    </Button>
  );
}
