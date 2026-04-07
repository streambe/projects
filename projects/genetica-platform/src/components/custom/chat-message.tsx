// TODO Sprint 2: render sanitized assistant/user message with role styling.
export function ChatMessage({ role, content }: { role: "user" | "assistant" | "system"; content: string }) {
  return (
    <div data-role={role} className="rounded-md border border-border p-3 text-sm">
      {content}
    </div>
  );
}
