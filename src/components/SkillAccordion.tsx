import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./ui";

export default function SkillAccordion() {
    return (
        <div className="max-w-md">
            <Accordion type="multiple" className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-foreground/90 text-lg border-border/40">Languages</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base">
                        <div>
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
                                    <ul className="grid gap-1">
                                        <li className="text-lg text-muted-foreground">- {lang}</li>
                                    </ul>
                                ))
                            }
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-foreground/90 text-lg border-border/40">Frameworks</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base">
                        <div>
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
                                    <ul className="grid gap-1">
                                        <li className="text-lg text-muted-foreground">- {lang}</li>
                                    </ul>
                                ))
                            }
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className="text-foreground/90 text-lg border-border/40">Databases</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base">
                        <div>

                            {
                                [
                                    "MongoDB",
                                    "PostgreSQL",
                                    "MySQL",
                                    "SQLite",
                                    "Realtime DB",
                                    "DynamoDB"

                                ].map((db, index) => (
                                    <ul className="grid gap-1">
                                        <li className="text-lg text-muted-foreground">- {db}</li>
                                    </ul>
                                ))
                            }
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className="text-foreground/90 text-lg border-border/40">Tools</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base">
                        <div>

                            {
                                [
                                    //tools
                                    "Git",
                                    "Docker",
                                    "Virtualization",
                                    "CI/CD",
                                    "Jenkins",
                                    "Github Actions",
                                ].map((tool, index) => (
                                    <ul className="grid gap-1">
                                        <li className="text-lg text-muted-foreground">- {tool}</li>
                                    </ul>
                                ))
                            }
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}