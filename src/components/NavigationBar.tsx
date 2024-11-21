import { BookAIcon, Briefcase, FolderGit2, Globe, HomeIcon, MailIcon } from "lucide-react"
import { cn } from "../lib/utils"
import { Button, ThemeToggle } from "./ui"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"


const navigationItems = [
    {
        path: "/",
        icon: <HomeIcon size={24} />,
        label: "Home",
    },
    {
        path: "/blog",
        icon: <BookAIcon size={24} />,
        label: "Blog",
    },
    {
        path: "/projects",
        icon: <FolderGit2 size={24} />,
        label: "Projects",
    },
    {
        path: "/resume",
        icon: <Briefcase size={24} />,
        label: "Resume",
    },
    {
        path: "/travel",
        icon: <Globe size={24} />,
        label: "Travel",
    },
];


export default function NavigationBar({
    className,
    path,
}: {
    className?: string
    path: string
}) {

    console.log({ path })
    return (
        <div id="bottomNav" className={cn(className, "block")}>
            <div className="fixed border-t lg:border-t-0 dark:border-border/30 bg-background/80 shadow md:shadow-none w-full md:sticky bottom-0 md:top-0 h-16 md:w-24 shrink-0 md:h-screen overflow-y-auto no-scrollbar lg:border-r z-50 backdrop-blur">
                <div className="h-full w-full flex flex-row md:flex-col pt-3 justify-between after:flex-1 after:mt-auto">
                    <div className="hidden md:block md:flex-1"></div>
                    <TooltipProvider>
                        <nav className="w-full">
                            <ul className="flex md:flex-col px-4 items-center justify-center md:h-full gap-3 md:gap-4 mb-4 md:mb-0 w-full">
                                {navigationItems.map((item, index) => {
                                    console.log({ path, item: item.path })
                                    const color = (path === "/" && item.path === "/") ? "text-primary" : (item.path !== "/" && path.includes(item.path)) ? "text-primary" : "text-muted-foreground"
                                    return (<Tooltip key={index}>
                                        <li className="w-full group">
                                            <a
                                                href={item.path}
                                                className={cn(
                                                    color,
                                                    "flex flex-col items-center justify-center group-hover:text-primary group-hover:scale-[1.12] duration-100 ease-in-out"
                                                )}
                                            >
                                                <TooltipTrigger asChild>
                                                    <Button variant={"ghost"} size={"sm"}>
                                                        {item.icon}
                                                    </Button>
                                                </TooltipTrigger>
                                            </a>
                                            <TooltipContent className="border-border/40">
                                                <p>{item.label}</p>
                                            </TooltipContent>
                                        </li>
                                    </Tooltip>
                                    )
                                }
                                )}
                            </ul>
                        </nav>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    )
} 