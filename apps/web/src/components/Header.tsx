import {
  Button,
  Input,
  SheetContent,
  SheetTrigger,
  cn,
} from "@prakhar/ui";
import {
  House,
  ArticleMedium,
  BriefcaseMetal,
  GlobeHemisphereEast
} from "@phosphor-icons/react";

export default function Header() {
  const navigationLinks = [
    { title: "home", href: "/", icon: House },
    { title: "blog", href: "/blog", icon: ArticleMedium },
    { title: "projects", href: "/projects", icon: BriefcaseMetal },
    { title: "about", href: "/about", icon: GlobeHemisphereEast },
  ];

  const activeTab = ["home", "blog", "projects", "about"];
  return (
    <header className="bg-background flex flex-1 flex-col gap-4 py-2 md:gap-8 justify-center">
      <div className="">
        <div className="">
          <header className="sticky top-0 flex h-16 items-center gap-4 bg-background">
            <nav className="flex items-center gap-3 text-sm">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    href={link.href}
                    key={link.title}
                    className={cn(
                      activeTab.includes(link.title.toLowerCase())
                        ? "text-foreground"
                        : "text-muted-foreground",
                      "transition-colors hover:text-foreground flex items-center gap-1.5"
                    )}
                  >
                    <Icon size={18} weight="duotone" />
                    {link.title}
                  </a>
                );
              })}
            </nav>
          </header>
        </div>
      </div>
    </header>
  );
}
