import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@prakhar/ui";

export default function SkillAccordion() {
    return (
        <div className="max-w-md">
            <Accordion type="multiple" className="w-full space-y-2">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-foreground/90 text-lg border-border/40">AI & LLMs</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base">
                        <ul className="grid gap-2">
                            {
                                [
                                    "Mastra",
                                    "Vercel AI SDK",
                                    "Anthropic Claude",
                                    "OpenAI",
                                    "RAG (pgvector, hybrid retrieval, reranking)",
                                    "Agent evals & LLM observability",
                                ].map((item, index) => (
                                    <li key={index} className="text-lg text-muted-foreground">- {item}</li>
                                ))
                            }
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-foreground/90 text-lg border-border/40">Languages</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base">
                        <ul className="grid gap-2">
                            {
                                [
                                    "Typescript",
                                    "Javascript",
                                    "Kotlin",
                                    "Python",
                                    "Go",
                                    "SQL",
                                ].map((lang, index) => (
                                    <li key={index} className="text-lg text-muted-foreground">- {lang}</li>
                                ))
                            }
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className="text-foreground/90 text-lg border-border/40">Frameworks</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base">
                        <ul className="grid gap-2">
                            {
                                [
                                    "React",
                                    "Next.js",
                                    "NestJS",
                                    "Fastify",
                                    "Express",
                                    "Astro",
                                    "TailwindCSS",
                                    "React Native",
                                    "Android",
                                ].map((lang, index) => (
                                    <li key={index} className="text-lg text-muted-foreground">- {lang}</li>
                                ))
                            }
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger className="text-foreground/90 text-lg border-border/40">Databases</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base">
                        <ul className="grid gap-2">
                            {
                                [
                                    "PostgreSQL (RLS, pgvector, Drizzle)",
                                    "Redis",
                                    "MongoDB",
                                    "MySQL",
                                    "SQLite",
                                ].map((db, index) => (
                                    <li key={index} className="text-lg text-muted-foreground">- {db}</li>
                                ))
                            }
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                    <AccordionTrigger className="text-foreground/90 text-lg border-border/40">Tools & Infra</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base">
                        <ul className="grid gap-2">
                            {
                                [
                                    "Git",
                                    "Docker",
                                    "GitHub Actions",
                                    "Cloudflare (Workers, R2, AI Gateway)",
                                    "Railway",
                                    "Turborepo",
                                    "Inngest",
                                    "Playwright",
                                ].map((tool, index) => (
                                    <li key={index} className="text-lg text-muted-foreground">- {tool}</li>
                                ))
                            }
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}