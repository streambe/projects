// TODO Sprint 2: avatar with color per role from team-roster (23 agents).
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AgentAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <Avatar>
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
