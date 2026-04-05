export const GEO_CODES = [
  { label: "Argentina", code: 100446943 },
  { label: "Buenos Aires", code: 104514572 },
  { label: "Córdoba", code: 106356764 },
  { label: "Colombia", code: 100876405 },
  { label: "México", code: 103323778 },
  { label: "Chile", code: 104621616 },
  { label: "Brasil", code: 106057199 },
] as const;

export const TITLE_PRESETS = [
  { label: "CTO", value: "CTO" },
  { label: "CIO", value: "CIO" },
  { label: "CEO", value: "CEO" },
  { label: "VP Technology", value: "VP Technology" },
  { label: "Director IT", value: "Director IT" },
  { label: "Director Tecnología", value: "Director Tecnología" },
  { label: "Gerente Tecnología", value: "Gerente Tecnología" },
  { label: "Director Innovación", value: "Director Innovación" },
] as const;

export const QUICK_SEARCHES = [
  {
    label: "CTOs Salud Argentina",
    description: "Chief Technology Officers en sector salud",
    icon: "stethoscope",
    title_keywords: ["CTO"],
    geo_codes: [100446943],
    keywords: "salud",
  },
  {
    label: "CIOs Hospitales",
    description: "Chief Information Officers en hospitales",
    icon: "building",
    title_keywords: ["CIO"],
    geo_codes: [100446943],
    keywords: "hospital",
  },
  {
    label: "CEOs Healthtech",
    description: "CEOs de empresas healthtech",
    icon: "rocket",
    title_keywords: ["CEO"],
    geo_codes: [100446943],
    keywords: "healthtech",
  },
  {
    label: "Directores IT Salud",
    description: "Directores de IT y Tecnología en salud",
    icon: "monitor",
    title_keywords: ["Director IT", "Director Tecnología"],
    geo_codes: [100446943],
    keywords: "salud",
  },
] as const;

export interface LinkedInEmployee {
  first_name: string;
  last_name: string;
  full_name: string;
  job_title: string;
  company: string;
  company_id: string;
  location: string;
  linkedin_url: string;
  profile_id: string;
  about: string;
}

export interface SearchStartResponse {
  request_id: string;
  message: string;
}

export interface SearchStatusResponse {
  status: "pending" | "done";
  total_count: number;
  employees_scraped_so_far: number;
  message: string;
}

export interface SearchResultsResponse {
  data: LinkedInEmployee[];
  total_count: number;
  employees_scraped_so_far: number;
}

// Keep old types for import-urls backward compatibility
export interface LinkedInSearchResult {
  full_name: string;
  first_name: string;
  last_name: string;
  headline: string;
  location: string;
  profile_url: string;
  profile_image_url: string | null;
  current_company: {
    name: string;
    linkedin_url: string;
    industry: string;
  } | null;
}

export interface LinkedInSearchResponse {
  data: LinkedInSearchResult[];
  total_result_count: number;
  page: number;
}

/** Parse a LinkedIn profile URL and extract name from slug */
export function parseLinkedInUrl(url: string): {
  valid: boolean;
  profileUrl: string;
  slug: string;
  firstName: string;
  lastName: string;
} {
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9\-_%]+)\/?/
  );
  if (!match) {
    return { valid: false, profileUrl: "", slug: "", firstName: "", lastName: "" };
  }

  const slug = decodeURIComponent(match[1]).replace(/\/$/, "");
  const profileUrl = `https://www.linkedin.com/in/${slug}/`;

  const cleanSlug = slug.replace(/-[a-f0-9]{6,}$/i, "").replace(/-\d+[a-z]*$/i, "");
  const parts = cleanSlug.split("-").filter(Boolean);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  const firstName = parts.length > 0 ? capitalize(parts[0]) : slug;
  const lastName = parts.length > 1 ? parts.slice(1).map(capitalize).join(" ") : "";

  return { valid: true, profileUrl, slug, firstName, lastName };
}
