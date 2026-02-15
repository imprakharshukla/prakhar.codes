import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@prakhar/ui";

export function HomeLabAccordion() {
  return (
    <div className="max-w-lg">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="why" className="border-border/30">
          <AccordionTrigger className="text-foreground/90 text-sm border-border/30">
            Why I run a home lab
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
            There's something deeply satisfying about owning your own
            infrastructure. No subscriptions, no vendor lock-in, no algorithms
            deciding what you see. I started with a Raspberry Pi running Pi-hole
            and it spiralled from there — now it's a full rack with media
            streaming, monitoring dashboards and smart home automation. It's the
            best way I've found to actually understand networking, containers and
            Linux at a level tutorials can't teach.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
