/**
 * Lead field definitions for CSV column mapping.
 */
export const LEAD_FIELDS = [
  { key: "firstName", label: "First Name", required: true },
  { key: "lastName", label: "Last Name", required: true },
  { key: "title", label: "Job Title", required: false },
  { key: "email", label: "Email", required: false },
  { key: "phone", label: "Phone", required: false },
  { key: "linkedinUrl", label: "LinkedIn URL", required: false },
  { key: "company", label: "Company", required: false },
  { key: "industry", label: "Industry", required: false },
] as const;

export type LeadFieldKey = (typeof LEAD_FIELDS)[number]["key"];

export type ColumnMapping = Record<string, LeadFieldKey | "">;

export interface MappedLead {
  firstName: string;
  lastName: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  company?: string;
  industry?: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

/**
 * Apply column mapping to CSV rows to produce MappedLead objects.
 */
export function applyMapping(
  rows: Record<string, string>[],
  mapping: ColumnMapping
): { leads: MappedLead[]; errors: string[] } {
  const leads: MappedLead[] = [];
  const errors: string[] = [];

  // Build reverse map: leadField -> csvColumn
  const reverseMap: Partial<Record<LeadFieldKey, string>> = {};
  for (const [csvCol, leadField] of Object.entries(mapping)) {
    if (leadField) {
      reverseMap[leadField] = csvCol;
    }
  }

  if (!reverseMap.firstName || !reverseMap.lastName) {
    return { leads: [], errors: ["firstName and lastName mappings are required"] };
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const firstName = row[reverseMap.firstName!]?.trim() || "";
    const lastName = row[reverseMap.lastName!]?.trim() || "";

    if (!firstName && !lastName) {
      errors.push(`Row ${i + 1}: Missing first and last name`);
      continue;
    }

    const lead: MappedLead = { firstName, lastName };

    if (reverseMap.title) lead.title = row[reverseMap.title]?.trim() || undefined;
    if (reverseMap.email) lead.email = row[reverseMap.email]?.trim() || undefined;
    if (reverseMap.phone) lead.phone = row[reverseMap.phone]?.trim() || undefined;
    if (reverseMap.linkedinUrl) lead.linkedinUrl = row[reverseMap.linkedinUrl]?.trim() || undefined;
    if (reverseMap.company) lead.company = row[reverseMap.company]?.trim() || undefined;
    if (reverseMap.industry) lead.industry = row[reverseMap.industry]?.trim() || undefined;

    // Basic email validation
    if (lead.email && !isValidEmail(lead.email)) {
      errors.push(`Row ${i + 1}: Invalid email "${lead.email}"`);
      lead.email = undefined;
    }

    leads.push(lead);
  }

  return { leads, errors };
}

/**
 * Parse a LinkedIn profile URL and extract what we can.
 */
export function parseLinkedInUrl(url: string): {
  linkedinUrl: string;
  firstName: string;
  lastName: string;
} | null {
  const trimmed = url.trim();
  if (!trimmed.includes("linkedin.com/in/")) return null;

  try {
    const urlObj = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
    );
    const pathname = urlObj.pathname.replace(/\/+$/, "");
    const slug = pathname.split("/").pop() || "";

    if (!slug) return null;

    // Try to extract name from slug (e.g., "john-doe-123abc" -> "John", "Doe")
    const parts = slug.split("-").filter((p) => !/^\d+$/.test(p) && p.length > 0);
    const firstName = capitalize(parts[0] || "Unknown");
    const lastName = capitalize(parts[1] || "");

    return {
      linkedinUrl: urlObj.href,
      firstName,
      lastName,
    };
  } catch {
    return null;
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
