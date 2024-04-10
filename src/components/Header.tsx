import {
  Button,
  Input,
  SheetContent,
  SheetTrigger,
  ThemeToggle,
} from "../components/ui";
import { cn } from "../lib/utils";
import { Menu, Search, Sheet } from "lucide-react";

export default function Header() {
  const navigationLinks = [
    { title: "home", href: "/" },
    { title: "blog", href: "/blog" },
    { title: "projects", href: "/projects" },
    { title: "about", href: "/about" },
  ];

  const activeTab = ["home", "blog", "projects", "about"];
  return (
    <header className="bg-background flex flex-1 flex-col gap-4 py-2 md:gap-8 justify-center">
      <div className="">
        <div className="">
          <header className="sticky top-0 flex h-16 items-center gap-4 bg-background">
            <nav className="flex items-center gap-3 text-sm">
              {navigationLinks.map((link) => {
                return (
                  <a
                    href={link.href}
                    key={link.title}
                    className={cn(
                      activeTab.includes(link.title.toLowerCase())
                        ? "text-foreground"
                        : "text-muted-foreground",
                      "transition-colors hover:text-foreground"
                    )}
                  >
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
