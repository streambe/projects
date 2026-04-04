import { describe, it, expect } from "vitest";
import { renderTemplate, type TemplateLeadData } from "../template-utils";

describe("renderTemplate", () => {
  const baseLead: TemplateLeadData = {
    firstName: "Juan",
    lastName: "Pérez",
    title: "CTO",
    company: { name: "Acme Corp", industry: "Salud" },
  };

  it("replaces all supported variables", () => {
    const content =
      "Hola {{nombre}} {{apellido}}, cargo {{cargo}} en {{empresa}} ({{industria}})";
    const result = renderTemplate(content, baseLead);
    expect(result).toBe(
      "Hola Juan Pérez, cargo CTO en Acme Corp (Salud)"
    );
  });

  it("replaces multiple occurrences of the same variable", () => {
    const content = "{{nombre}} y {{nombre}}";
    const result = renderTemplate(content, baseLead);
    expect(result).toBe("Juan y Juan");
  });

  it("returns empty string for missing company", () => {
    const lead: TemplateLeadData = {
      firstName: "Ana",
      lastName: "Lopez",
      company: null,
    };
    const result = renderTemplate("Empresa: {{empresa}}, Industria: {{industria}}", lead);
    expect(result).toBe("Empresa: , Industria: ");
  });

  it("returns empty string for missing title", () => {
    const lead: TemplateLeadData = {
      firstName: "Pedro",
      lastName: "Garcia",
      title: null,
    };
    const result = renderTemplate("Cargo: {{cargo}}", lead);
    expect(result).toBe("Cargo: ");
  });

  it("returns content unchanged if no variables present", () => {
    const content = "Hello world, no variables here";
    const result = renderTemplate(content, baseLead);
    expect(result).toBe(content);
  });

  it("handles empty content", () => {
    expect(renderTemplate("", baseLead)).toBe("");
  });

  it("handles company with undefined industry", () => {
    const lead: TemplateLeadData = {
      firstName: "Maria",
      lastName: "Test",
      company: { name: "TestCo", industry: null },
    };
    const result = renderTemplate("{{industria}}", lead);
    expect(result).toBe("");
  });

  it("handles company with undefined name", () => {
    const lead: TemplateLeadData = {
      firstName: "Test",
      lastName: "User",
      company: { name: undefined as unknown as string },
    };
    const result = renderTemplate("{{empresa}}", lead);
    expect(result).toBe("");
  });
});
