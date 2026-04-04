import { describe, it, expect } from "vitest";
import { parseCsv } from "@/lib/csv-parser";

describe("parseCsv", () => {
  it("should parse a simple CSV", () => {
    const csv = `firstName,lastName,email
John,Doe,john@example.com
Jane,Smith,jane@example.com`;

    const result = parseCsv(csv);
    expect(result.headers).toEqual(["firstName", "lastName", "email"]);
    expect(result.rows).toHaveLength(2);
    expect(result.totalRows).toBe(2);
    expect(result.rows[0]).toEqual({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    });
  });

  it("should handle quoted fields with commas", () => {
    const csv = `name,title
"Doe, John","VP, Engineering"`;

    const result = parseCsv(csv);
    expect(result.rows[0].name).toBe("Doe, John");
    expect(result.rows[0].title).toBe("VP, Engineering");
  });

  it("should handle escaped quotes inside quoted fields", () => {
    const csv = `name,note
"John ""JD"" Doe","says ""hello"""`;

    const result = parseCsv(csv);
    expect(result.rows[0].name).toBe('John "JD" Doe');
    expect(result.rows[0].note).toBe('says "hello"');
  });

  it("should handle empty CSV", () => {
    const result = parseCsv("");
    expect(result.headers).toEqual([]);
    expect(result.rows).toEqual([]);
    expect(result.totalRows).toBe(0);
  });

  it("should handle CSV with only headers", () => {
    const result = parseCsv("a,b,c");
    expect(result.headers).toEqual(["a", "b", "c"]);
    expect(result.rows).toEqual([]);
  });

  it("should handle CRLF line endings", () => {
    const csv = "a,b\r\n1,2\r\n3,4";
    const result = parseCsv(csv);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ a: "1", b: "2" });
  });

  it("should handle rows with fewer columns than headers", () => {
    const csv = `a,b,c
1,2`;

    const result = parseCsv(csv);
    expect(result.rows[0]).toEqual({ a: "1", b: "2", c: "" });
  });

  it("should skip empty rows", () => {
    const csv = `a,b
1,2

3,4`;

    const result = parseCsv(csv);
    expect(result.rows).toHaveLength(2);
  });

  it("should trim whitespace from values", () => {
    const csv = `a , b
 hello , world `;

    const result = parseCsv(csv);
    expect(result.headers).toEqual(["a", "b"]);
    expect(result.rows[0]).toEqual({ a: "hello", b: "world" });
  });
});
