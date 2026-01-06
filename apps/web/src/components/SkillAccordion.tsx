import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@prakhar/ui";

export default function SkillAccordion() {
    return (
        <div className="max-w-md">
            <Accordion type="multiple" className="w-full space-y-2">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-foreground/90 text-lg border-border/40">Languages</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base">
                        <ul className="grid gap-2">
                            {
                                [
                                    "Typescript",
                                    "Javascript",
                                    "Kotlin",
                                    "Java",
                                    "C++",
                                    "C",
                                    "Python",
                                    "Go",
                                ].map((lang, index) => (
                                    <li key={index} className="text-lg text-muted-foreground">- {lang}</li>
                                ))
                            }
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-foreground/90 text-lg border-border/40">Frameworks</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base">
                        <ul className="grid gap-2">
                            {
                                ["Android",
                                    "React",
                                    "NextJS",
                                    "Express",
                                    "TailwindCSS",
                                    "Vue",
                                    "NestJS",
                                    "NuxtJS",
                                    "React Native",
                                ].map((lang, index) => (
                                    <li key={index} className="text-lg text-muted-foreground">- {lang}</li>
                                ))
                            }
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className="text-foreground/90 text-lg border-border/40">Databases</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base">
                        <ul className="grid gap-2">
                            {
                                [
                                    "MongoDB",
                                    "PostgreSQL",
                                    "MySQL",
                                    "SQLite",
                                    "Realtime DB",
                                    "DynamoDB"
                                ].map((db, index) => (
                                    <li key={index} className="text-lg text-muted-foreground">- {db}</li>
                                ))
                            }
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger className="text-foreground/90 text-lg border-border/40">Tools</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base">
                        <ul className="grid gap-2">
                            {
                                [
                                    "Git",
                                    "Docker",
                                    "Virtualization",
                                    "CI/CD",
                                    "Jenkins",
                                    "Github Actions",
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