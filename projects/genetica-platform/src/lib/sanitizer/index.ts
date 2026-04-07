/**
 * Sprint 5 sanitizer — regex layer.
 *
 * Detects and scrubs Claude-Code / agent-SDK leakage from assistant messages
 * before they are persisted or streamed to the UI.
 *
 * TODO Sprint 6+: add an LLM fallback with Haiku when violations.length > 0
 * so that heavily contaminated messages get a full rewrite instead of a
 * redacted-with-placeholders version.
 */

type Rule = {
  id: string;
  pattern: RegExp;
  replacement: string | ((match: string) => string);
};

const RULES: Rule[] = [
  // Triple-backtick code fences (multiline).
  {
    id: "code_fence",
    pattern: /```[\s\S]*?```/g,
    replacement: "[bloque de código omitido]",
  },
  // Inline agent/tool-use XML tags.
  {
    id: "function_calls_tag",
    pattern: /<\/?function_calls>[\s\S]*?(?=<\/function_calls>|$)/gi,
    replacement: "",
  },
  {
    id: "task_report_tag",
    pattern: /<\/?task_report>[\s\S]*?(?=<\/task_report>|$)/gi,
    replacement: "",
  },
  {
    id: "system_reminder_tag",
    pattern: /<\/?system-reminder>[\s\S]*?(?=<\/system-reminder>|$)/gi,
    replacement: "",
  },
  {
    id: "invoke_tag",
    pattern: /<\/?antml:(?:function_calls|invoke|parameter)[^>]*>/gi,
    replacement: "",
  },
  // Windows absolute paths: c:\foo\bar or C:/foo/bar
  {
    id: "win_abs_path",
    pattern: /\b[A-Za-z]:[\\/][^\s"'`<>]+/g,
    replacement: "[ruta omitida]",
  },
  // Unix absolute paths (/usr, /home, /etc, /var, /opt, /tmp, /root).
  {
    id: "unix_abs_path",
    pattern: /(?<![\w./])\/(?:usr|home|etc|var|opt|tmp|root|bin|sbin)\/[^\s"'`<>]+/g,
    replacement: "[ruta omitida]",
  },
  // Bash-style leading commands on their own line.
  {
    id: "bash_line",
    pattern:
      /^[ \t]*(?:\$|>|#)?[ \t]*(?:cd|ls|cat|mkdir|rm|cp|mv|grep|find|sed|awk|curl|wget|chmod|chown|git|npm|pnpm|yarn|node|npx|python|pip|bash|sh|echo|touch|tar|zip|unzip|ssh|scp|docker|kubectl)\b[^\n]*$/gim,
    replacement: "[comando omitido]",
  },
  // Claude Code / agent SDK jargon — replace with generic wording.
  {
    id: "jargon",
    pattern:
      /\b(?:Claude Code|Anthropic SDK|Agent SDK|function_calls|tool_use|tool_use_id|subagent_type|system-reminder|harness|cwd|CLAUDE\.md|anthropic\.messages)\b/gi,
    replacement: "el entorno de trabajo",
  },
  // Leftover raw XML-ish tool tags like <tool_use ...> or <parameter ...>
  {
    id: "xml_tool_tag",
    pattern: /<\/?(?:tool_use|parameter|invoke|function_call)[^>]*>/gi,
    replacement: "",
  },
];

export type SanitizeResult = {
  clean: string;
  violations: string[];
};

/**
 * Sanitizes an assistant message. Returns the cleaned text and a list of
 * rule ids that fired (for logging / observability / future LLM fallback).
 */
export function sanitizeAssistantMessage(text: string): SanitizeResult {
  let out = text;
  const violations: string[] = [];

  for (const rule of RULES) {
    const before = out;
    if (typeof rule.replacement === "function") {
      const fn = rule.replacement;
      out = out.replace(rule.pattern, (m: string) => fn(m));
    } else {
      out = out.replace(rule.pattern, rule.replacement);
    }
    if (before !== out) {
      violations.push(rule.id);
    }
  }

  // Collapse double newlines that redaction may have introduced.
  out = out.replace(/\n{3,}/g, "\n\n").trim();

  return { clean: out, violations };
}

/**
 * Back-compat: old call sites import `sanitize` for a simple string return.
 */
export function sanitize(raw: string): string {
  return sanitizeAssistantMessage(raw).clean;
}
