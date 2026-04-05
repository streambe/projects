export const GEO_CODES: Record<string, string> = {
  Argentina: "100446943",
  "Buenos Aires": "104514572",
  "Córdoba": "106356764",
  Colombia: "100876405",
  México: "103323778",
  Chile: "104621616",
  Brasil: "106057199",
  LATAM: "",
};

export const TITLE_PRESETS = [
  { label: "CTO / Chief Technology Officer", keyword: "CTO" },
  { label: "CIO / Chief Information Officer", keyword: "CIO" },
  { label: "CEO / Chief Executive Officer", keyword: "CEO" },
  { label: "VP Tecnología", keyword: "VP Technology" },
  { label: "Director IT / Sistemas", keyword: "Director IT" },
  { label: "Gerente de Tecnología", keyword: "Gerente Tecnología" },
  { label: "Director de Innovación", keyword: "Director Innovación" },
  { label: "CTO + Salud", keyword: "CTO healthcare" },
] as const;

export const QUICK_SEARCHES = [
  {
    label: "CTOs Salud Argentina",
    keyword: "CTO healthcare",
    geo_code: "100446943",
  },
  {
    label: "CIOs Hospitales",
    keyword: "CIO hospital",
    geo_code: "100446943",
  },
  {
    label: "CEOs Healthtech LATAM",
    keyword: "CEO healthtech",
    geo_code: "",
  },
  {
    label: "Directores IT Salud",
    keyword: "Director IT salud",
    geo_code: "100446943",
  },
] as const;

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
