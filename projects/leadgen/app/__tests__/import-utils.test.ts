import { describe, it, expect } from "vitest";
import { applyMapping, parseLinkedInUrl, type ColumnMapping } from "@/lib/import-utils";

describe("applyMapping", () => {
  const rows = [
    { "First Name": "John", "Last Name": "Doe", Email: "john@example.com", Company: "Acme" },
    { "First Name": "Jane", "Last Name": "Smith", Email: "jane@example.com", Company: "Corp" },
  ];

  it("should map columns correctly", () => {
    const mapping: ColumnMapping = {
      "First Name": "firstName",
      "Last Name": "lastName",
      Email: "email",
      Company: "company",
    };

    const { leads, errors } = applyMapping(rows, mapping);
    expect(leads).toHaveLength(2);
    expect(leads[0]).toEqual({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      company: "Acme",
    });
    expect(errors).toHaveLength(0);
  });

  it("should error when firstName/lastName mappings are missing", () => {
    const mapping: ColumnMapping = { Email: "email" };
    const { leads, errors } = applyMapping(rows, mapping);
    expect(leads).toHaveLength(0);
    expect(errors).toContain("firstName and lastName mappings are required");
  });

  it("should skip rows with empty first and last name", () => {
    const rowsWithEmpty = [
      { Name: "", Surname: "", Email: "x@y.com" },
    ];
    const mapping: ColumnMapping = { Name: "firstName", Surname: "lastName" };
    const { leads, errors } = applyMapping(rowsWithEmpty, mapping);
    expect(leads).toHaveLength(0);
    expect(errors[0]).toContain("Row 1: Missing first and last name");
  });

  it("should flag invalid emails but still include the lead", () => {
    const rowsWithBadEmail = [
      { fn: "John", ln: "Doe", em: "not-an-email" },
    ];
    const mapping: ColumnMapping = { fn: "firstName", ln: "lastName", em: "email" };
    const { leads, errors } = applyMapping(rowsWithBadEmail, mapping);
    expect(leads).toHaveLength(1);
    expect(leads[0].email).toBeUndefined(); // invalid email removed
    expect(errors[0]).toContain('Invalid email "not-an-email"');
  });

  it("should handle skipped columns", () => {
    const mapping: ColumnMapping = {
      "First Name": "firstName",
      "Last Name": "lastName",
      Email: "",  // skip
    };
    const { leads } = applyMapping(rows, mapping);
    expect(leads[0].email).toBeUndefined();
  });

  it("should handle all optional fields", () => {
    const fullRows = [
      {
        fn: "A", ln: "B", t: "CTO", e: "a@b.com",
        p: "123", li: "https://linkedin.com/in/ab", co: "X", ind: "Tech",
      },
    ];
    const mapping: ColumnMapping = {
      fn: "firstName", ln: "lastName", t: "title", e: "email",
      p: "phone", li: "linkedinUrl", co: "company", ind: "industry",
    };
    const { leads } = applyMapping(fullRows, mapping);
    expect(leads[0]).toEqual({
      firstName: "A", lastName: "B", title: "CTO", email: "a@b.com",
      phone: "123", linkedinUrl: "https://linkedin.com/in/ab",
      company: "X", industry: "Tech",
    });
  });
});

describe("parseLinkedInUrl", () => {
  it("should parse a standard LinkedIn URL", () => {
    const result = parseLinkedInUrl("https://linkedin.com/in/john-doe");
    expect(result).toEqual({
      linkedinUrl: "https://linkedin.com/in/john-doe",
      firstName: "John",
      lastName: "Doe",
    });
  });

  it("should handle URL with trailing slash", () => {
    const result = parseLinkedInUrl("https://www.linkedin.com/in/jane-smith/");
    expect(result).not.toBeNull();
    expect(result!.firstName).toBe("Jane");
    expect(result!.lastName).toBe("Smith");
  });

  it("should handle slug with numeric suffix", () => {
    const result = parseLinkedInUrl("https://linkedin.com/in/john-doe-123abc");
    expect(result).not.toBeNull();
    expect(result!.firstName).toBe("John");
    expect(result!.lastName).toBe("Doe");
  });

  it("should return null for non-LinkedIn URLs", () => {
    expect(parseLinkedInUrl("https://twitter.com/john")).toBeNull();
  });

  it("should return null for empty string", () => {
    expect(parseLinkedInUrl("")).toBeNull();
  });

  it("should handle URL without protocol", () => {
    const result = parseLinkedInUrl("linkedin.com/in/maria-garcia");
    expect(result).not.toBeNull();
    expect(result!.firstName).toBe("Maria");
  });

  it("should handle single-name slug", () => {
    const result = parseLinkedInUrl("https://linkedin.com/in/madonna");
    expect(result).not.toBeNull();
    expect(result!.firstName).toBe("Madonna");
    expect(result!.lastName).toBe("");
  });
});
