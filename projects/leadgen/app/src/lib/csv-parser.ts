export interface CsvParseResult {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

/**
 * Parse CSV text into headers + rows.
 * Handles quoted fields with commas and newlines inside quotes.
 */
export function parseCsv(text: string): CsvParseResult {
  const lines = splitCsvLines(text.trim());
  if (lines.length === 0) {
    return { headers: [], rows: [], totalRows: 0 };
  }

  const headers = parseCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === "")) continue;

    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (values[j] ?? "").trim();
    }
    rows.push(row);
  }

  return { headers, rows, totalRows: rows.length };
}

/**
 * Split CSV text into lines, respecting quoted fields that contain newlines.
 */
function splitCsvLines(text: string): string[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") i++; // skip \r\n
      if (current.trim().length > 0) lines.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim().length > 0) lines.push(current);
  return lines;
}

/**
 * Parse a single CSV line into an array of field values.
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}
