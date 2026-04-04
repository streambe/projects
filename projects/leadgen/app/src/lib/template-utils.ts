export interface TemplateLeadData {
  firstName: string;
  lastName: string;
  title?: string | null;
  company?: { name?: string; industry?: string | null } | null;
}

export function renderTemplate(content: string, lead: TemplateLeadData): string {
  return content
    .replace(/\{\{nombre\}\}/g, lead.firstName || "")
    .replace(/\{\{apellido\}\}/g, lead.lastName || "")
    .replace(/\{\{empresa\}\}/g, lead.company?.name || "")
    .replace(/\{\{cargo\}\}/g, lead.title || "")
    .replace(/\{\{industria\}\}/g, lead.company?.industry || "");
}
