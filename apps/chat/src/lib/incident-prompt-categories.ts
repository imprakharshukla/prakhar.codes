import {
  AlertTriangleIcon,
  ClipboardListIcon,
  PackageIcon,
  CalendarIcon,
} from "lucide-react";
import type { PromptCategory } from "./prompt-categories";

export const incidentPromptCategories: PromptCategory[] = [
  {
    id: "rapporter-hendelse",
    name: "Rapporter hendelse",
    icon: AlertTriangleIcon,
    prompts: [
      "Jeg så en gaffeltruck nesten treffe noen i gang 3",
      "En pall falt fra hylle B-12",
      "Det var en lekkasje i lageret",
      "Jeg oppdaget en sikkerhetsrisiko",
    ],
  },
  {
    id: "sikkerhetsbrudd",
    name: "Sikkerhetsbrudd",
    icon: AlertTriangleIcon,
    prompts: [
      "Rapporter sikkerhetsbrudd: Manglende verneutstyr",
      "Rapporter sikkerhetsbrudd: Uautoriserte personer i området",
      "Rapporter sikkerhetsbrudd: Brudd på prosedyrer",
      "Rapporter sikkerhetsbrudd: Feil bruk av utstyr",
    ],
  },
];

// Admin-specific reporting categories for office/administrative domain
export const adminReportingCategories: PromptCategory[] = [
  {
    id: "avvik-forbedring",
    name: "Avvik / Forbedringsforslag",
    icon: ClipboardListIcon,
    prompts: [
      "Jeg vil melde inn et avvik",
      "Forslag til forbedring av rutine",
      "Noe fungerer ikke som det skal",
      "Jeg har oppdaget en feil i prosedyren",
    ],
  },
  {
    id: "behov-utstyr",
    name: "Behov / Utstyrsbestilling",
    icon: PackageIcon,
    prompts: [
      "Jeg trenger nytt utstyr",
      "Bestille kontorutstyr",
      "PC-en min må byttes",
      "Vi mangler utstyr på kontoret",
    ],
  },
  {
    id: "arrangement-status",
    name: "Arrangement / Møtestatus",
    icon: CalendarIcon,
    prompts: [
      "Status på planlagt arrangement",
      "Oppdatering fra møte",
      "Koordinering av event",
      "Oppfølging av arrangement",
    ],
  },
];

// Get reporting categories by domain
export function getReportingCategories(domainId: string): PromptCategory[] {
  if (domainId === "admin-assistant") {
    return adminReportingCategories;
  }
  return incidentPromptCategories;
}
