import {
  House,
  ArticleMedium,
  FloppyDisk,
  BriefcaseMetal,
  GlobeHemisphereEast,
  Island,
} from "@phosphor-icons/react";
import { cn } from "@prakhar/ui/lib";
import { Button } from "@prakhar/ui";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@prakhar/ui";

const navigationItems = [
  {
    path: "/",
    icon: <House size={24} weight="duotone" />,
    label: "Home",
  },
  {
    path: "/blog",
    icon: <ArticleMedium size={24} weight="duotone" />,
    label: "Blog",
  },
  {
    path: "/projects",
    icon: <FloppyDisk size={24} weight="duotone" />,
    label: "Projects",
  },
  {
    path: "/resume",
    icon: <BriefcaseMetal size={24} weight="duotone" />,
    label: "Resume",
  },
  {
    path: "/travel",
    icon: <GlobeHemisphereEast size={24} weight="duotone" />,
    label: "Travel",
  },
  {
    path: "/life",
    icon: <Island size={24} weight="duotone" />,
    label: "Life",
  },
];

export default function NavigationBar({
  className,
  path,
}: {
  className?: string;
  path: string;
}) {
  console.log({ path });
  return (
    <div id="bottomNav" className={cn(className, "block")}>
      <div className="fixed border-t lg:border-t-0 dark:border-border/30 bg-background/80 shadow md:shadow-none w-full md:sticky bottom-0 md:top-0 h-16 md:w-24 shrink-0 md:h-screen overflow-y-auto no-scrollbar lg:border-r z-40 backdrop-blur">
        <div className="h-full w-full flex flex-row md:flex-col pt-3 justify-between after:flex-1 after:mt-auto">
          <div className="hidden md:block md:flex-1"></div>
          <TooltipProvider>
            <nav className="w-full">
              <ul className="flex md:flex-col px-2 md:px-4 items-center justify-evenly md:justify-center md:h-full gap-1 md:gap-4 mb-4 md:mb-0 w-full">
                {navigationItems.map((item, index) => {
                  console.log({ path, item: item.path });
                  const color =
                    path === "/" && item.path === "/"
                      ? "text-primary"
                      : item.path !== "/" && path.includes(item.path)
                      ? "text-primary"
                      : "text-muted-foreground";
                  return (
                    <Tooltip key={index}>
                      <li className="w-full group">
                        <a
                          href={item.path}
                          className={cn(
                            color,
                            "flex flex-col items-center justify-center group-hover:text-primary group-hover:scale-[1.12] duration-100 ease-in-out"
                          )}
                        >
                          <TooltipTrigger asChild>
                            <Button variant={"ghost"} className="px-2 md:px-4">{item.icon}</Button>
                          </TooltipTrigger>
                        </a>
                        <TooltipContent className="border-border/40">
                          {item.label}
                        </TooltipContent>
                      </li>
                    </Tooltip>
                  );
                })}
              </ul>
            </nav>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
