"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/types/database";

type User = Tables<"users">;

type Mode = { kind: "closed" } | { kind: "create" } | { kind: "edit"; user: User };

export function UsersTable({ initialUsers }: { initialUsers: User[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [mode, setMode] = useState<Mode>({ kind: "closed" });
  const [pending, startTransition] = useTransition();

  async function refresh() {
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      setUsers(json.data ?? []);
    }
    router.refresh();
  }

  async function handleDelete(user: User) {
    if (!confirm(`¿Desactivar a ${user.full_name}?`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Usuario desactivado");
        await refresh();
      } else {
        const json = await res.json().catch(() => ({}));
        toast.error(json.error ?? "Error al desactivar");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{users.length} usuarios</p>
        <Button onClick={() => setMode({ kind: "create" })}>
          <Plus className="h-4 w-4" />
          Crear usuario
        </Button>
      </div>

      <div className="rounded-lg border border-border/60 bg-card/40">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-mono text-xs">{u.email}</TableCell>
                <TableCell>{u.full_name}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {u.is_active ? (
                    <Badge variant="outline" className="border-green-500/40 text-green-400">
                      activo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                      inactivo
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString("es-AR")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMode({ kind: "edit", user: u })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={pending || !u.is_active}
                      onClick={() => handleDelete(u)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No hay usuarios.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {mode.kind === "create" && (
        <CreateUserDialog
          onClose={() => setMode({ kind: "closed" })}
          onSuccess={refresh}
        />
      )}
      {mode.kind === "edit" && (
        <EditUserDialog
          user={mode.user}
          onClose={() => setMode({ kind: "closed" })}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}

function CreateUserDialog({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState<"admin" | "ingeniero_ia">("ingeniero_ia");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
        full_name: fd.get("full_name"),
        role,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      toast.success("Usuario creado");
      await onSuccess();
      onClose();
    } else {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error ?? "Error al crear");
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear usuario</DialogTitle>
          <DialogDescription>El usuario podrá iniciar sesión inmediatamente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña inicial</Label>
            <Input id="password" name="password" type="text" minLength={8} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input id="full_name" name="full_name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "admin" | "ingeniero_ia")}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ingeniero_ia">Ingeniero IA</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({
  user,
  onClose,
  onSuccess,
}: {
  user: User;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState<"admin" | "ingeniero_ia">(
    user.role === "admin" ? "admin" : "ingeniero_ia"
  );
  const [isActive, setIsActive] = useState(user.is_active);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fd.get("full_name"),
        role,
        is_active: isActive,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      toast.success("Usuario actualizado");
      await onSuccess();
      onClose();
    } else {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error ?? "Error al actualizar");
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription className="font-mono text-xs">{user.email}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input id="full_name" name="full_name" defaultValue={user.full_name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "admin" | "ingeniero_ia")}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ingeniero_ia">Ingeniero IA</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Activo
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
