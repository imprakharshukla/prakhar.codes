import {
  CodeIcon,
  FileTextIcon,
  BriefcaseIcon,
  WrenchIcon,
} from "lucide-react";

export type PromptCategory = {
  id: string;
  name: string;
  icon: typeof CodeIcon;
  prompts: string[];
};

export const promptCategories: PromptCategory[] = [
  {
    id: "projects",
    name: "Projects",
    icon: CodeIcon,
    prompts: [
      "Tell me about the Andronix project",
      "What technologies did you use in TravelLog?",
      "How does the LaTeX resume deployment work?",
      "What was the most challenging project you built?",
    ],
  },
  {
    id: "blog",
    name: "Blog Posts",
    icon: FileTextIcon,
    prompts: [
      "What have you written about AI and development?",
      "Tell me about your experience with Mastra",
      "What are your thoughts on modern web development?",
      "Show me your latest blog posts",
    ],
  },
  {
    id: "experience",
    name: "Experience",
    icon: BriefcaseIcon,
    prompts: [
      "What's your experience with TypeScript?",
      "Tell me about your work with React and Next.js",
      "What projects have you worked on professionally?",
      "What's your background in software development?",
    ],
  },
  {
    id: "tech-stack",
    name: "Tech Stack",
    icon: WrenchIcon,
    prompts: [
      "What technologies do you work with?",
      "How do you deploy your applications?",
      "What's your preferred development setup?",
      "What frameworks and tools do you use?",
    ],
  },
];
