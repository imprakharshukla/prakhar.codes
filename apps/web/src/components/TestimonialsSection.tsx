import { cn } from "@prakhar/ui";
import { useState } from "react";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  relationship: string;
  date: string;
  image: string;
  content: string;
  linkedinUrl: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Jakob Erikstad",
    role: "CEO @ Yobr",
    company: "Yobr",
    relationship: "Jakob managed Prakhar directly",
    date: "January 4, 2026",
    image: "https://media.licdn.com/dms/image/v2/C4E03AQEUPcSQmCiBjw/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1633700346750?e=1769644800&v=beta&t=ziGE4p9uHWt2EgCFTB-bZ69_kSqI0kzKgz0o3omezXE",
    linkedinUrl: "https://www.linkedin.com/in/jakob-erikstad",
    content: "I have worked with Prakhar for about a year, and he is one of the best developers I know. Despite his young age, he consistently performs at a level well above many more senior developers, combining strong technical understanding, rapid execution, and clear initiative. It has been a pleasure working with him, and I hope to do so again in the future."
  },
  {
    name: "Raman Gupta",
    role: "Training better and more doctors with CaseCraft, the AI Training Simulator for Medicine | CS + Bioinformatics @ NUS",
    company: "CaseCraft",
    relationship: "Raman managed Prakhar directly",
    date: "January 5, 2026",
    image: "https://media.licdn.com/dms/image/v2/D5603AQHDn6QHVFkEfw/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1706348931578?e=1769644800&v=beta&t=RvNkEKSkNXGVp6Y7JO2f6sIbddoP_JLX3UEsE9uwKwg",
    linkedinUrl: "https://www.linkedin.com/in/raman-gupta-9a40441aa",
    content: "I had the pleasure of working with Prakhar at CaseCraft, where he was a key contributor to our medical AI platform as a full-stack engineer.\n\nPrakhar built our entire frontend using React and TanStack Router and designed a robust TypeScript backend with true end-to-end type safety, which became the foundation of the product. He also led our migration from JavaScript to TypeScript across the codebase, significantly improving reliability and reducing application errors.\n\nWhat really sets Prakhar apart is his speed of development and ownership mindset. His ability to move fast without sacrificing quality is exceptional. Beyond execution, he consistently suggested and led important architectural and infrastructure improvements, making thoughtful decisions that scaled well with the product's growth. He also led our entire deployment and setup process, taking full responsibility for shipping and maintaining a production-ready system.\n\nPrakhar implemented our AI pipelines using OpenAI and demonstrated strong technical judgment paired with solid product intuition. He deeply understands the problem, aligns with expectations quickly, and delivers solutions that are often better than initially envisioned.\n\nHe works extremely independently, has a clear can-do attitude, communicates exceptionally well, and is someone you can trust to take ambiguous problems and turn them into high-quality outcomes. Every time he took on a task, he delivered a phenomenal job.\n\nPrakhar is a real asset to any team, and I would happily work with him again. I strongly recommend him to any team looking for a fast, reliable, and thoughtful engineer."
  },
  {
    name: "Harsh Agrawal",
    role: "Founder techkareer.com | ZFellow | Ex Avalara",
    company: "TechKareer",
    relationship: "Prakhar was Harsh's client",
    date: "January 5, 2026",
    image: "https://media.licdn.com/dms/image/v2/D5635AQFdrq1H8nsedw/profile-framedphoto-shrink_100_100/profile-framedphoto-shrink_100_100/0/1727731710317?e=1768374000&v=beta&t=6vJtciKZpWpj-cv7ZhKEOOr3dx4XFN-lhHg6DUfgZuw",
    linkedinUrl: "https://www.linkedin.com/in/itsharshag",
    content: "Prakhar is one of the most exceptional engineers I have come across. Great technical skills, communication skills, and initiative. Has a portfolio of stunning projects especially an Android app with millions of installs that he built almost single-handedly.\n\nWe got connected when he sent one of the most impressive cold DMs to explore a role at TechKareer. We were not hiring for ourselves at that time but luckily one of our hiring partners were. It was a pleasure him to refer him to them. They were also impressed by his experience and performance on the deliverables.\n\nPost that he has gone on many more amazing stints. He will be an invaluable asset to whichever org he decides to join. Godspeed!"
  }
];

const LinkedInIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-muted-foreground group-hover:text-foreground transition-colors"
  >
    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
  </svg>
);

const TestimonialsSection: React.FC<{ headingVisible?: boolean }> = ({
  headingVisible = false,
}) => {
  const [expandedTestimonials, setExpandedTestimonials] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    setExpandedTestimonials(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="grid gap-2 md:max-w-2xl">
      {headingVisible && (
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">
          Testimonials
        </h2>
      )}
      <div className="grid gap-0">
        {testimonials.map((testimonial, index) => {
          const isExpanded = expandedTestimonials.has(index);
          return (
            <div
              key={index}
              className={cn(
                "group",
                index === 0 ? "pb-4 sm:pb-6" : "py-4 sm:py-6",
                index !== testimonials.length - 1 && "border-b border-dotted border-border/60"
              )}
            >
              <div className="flex items-start gap-3 sm:gap-4 mb-3">
                <a
                  href={testimonial.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-border group-hover:border-primary/50 transition-colors"
                  />
                </a>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <a
                        href={testimonial.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group/link"
                      >
                        <span className="truncate">{testimonial.name}</span>
                        <LinkedInIcon />
                      </a>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground/70 mt-1.5">
                    {testimonial.date} · {testimonial.relationship}
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                <div className={cn(!isExpanded && "line-clamp-3")}>
                  {testimonial.content}
                </div>
                <button
                  onClick={() => toggleExpanded(index)}
                  className="text-primary hover:text-primary/80 font-medium text-xs mt-2 transition-colors"
                >
                  {isExpanded ? "show less" : "read more"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestimonialsSection;
