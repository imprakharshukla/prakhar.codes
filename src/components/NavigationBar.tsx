import { BookAIcon, Briefcase, FolderGit2, Globe, HomeIcon, MailIcon } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "./ui"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

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
            {/* <div className="backdrop-blur-md bg-background/50 border-t border-border/50 inset-x-0 bottom-0 h-16 md:h-full fixed xs:rounded-t md:border-r md:px-10 md:max-w-[150px]">   */}
            <div className="fixed border-t lg:border-t-0 dark:border-border/40 bg-background/80 border-border w-full md:sticky bottom-0 md:top-0 h-16 md:w-24 shrink-0 md:h-screen overflow-y-auto no-scrollbar lg:border-r z-50 backdrop-blur">
                <div className="h-full w-full flex flex-row md:flex-col pt-3 justify-between after:flex-1 after:mt-auto">
                    <div className="hidden md:block md:flex-1"></div>
                    <nav className="w-full">
                        <ul className="flex md:flex-col px-4 items-center justify-center md:h-full gap-3 md:gap-4 mb-4 md:mb-0 w-full">
                            <TooltipProvider>
                                <Tooltip open>

                                    <li className="w-full group">
                                        <a href="/" className={cn(path === "/" ?
                                            "text-primary" : "text-muted-foreground", "flex flex-col items-center justify-center group-hover:text-primary group-hover:scale-[1.12] duration-100 ease-in-out")}>
                                            <TooltipTrigger asChild>
                                                <Button variant={"ghost"} size={"sm"}>
                                                    < HomeIcon size={24} />
                                                </Button>
                                            </TooltipTrigger>
                                        </a>

                                    </li>
                                    <TooltipContent>
                                        <p>Home</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <li className="w-full group">
                                <a href="/blog" className={cn(path.includes("/blog") ?
                                    "text-primary" : "text-muted-foreground", "flex flex-col items-center justify-center group-hover:text-primary group-hover:scale-[1.12] duration-100 ease-in-out")}>
                                    <Button variant={"ghost"} size={"sm"}>
                                        < BookAIcon size={24} />
                                    </Button>
                                </a>
                            </li>
                            <li className="w-full group">
                                <a href="/projects" className={cn(path.includes("/project") ?
                                    "text-primary" : "text-muted-foreground", "flex flex-col items-center justify-center group-hover:text-primary group-hover:scale-[1.12] duration-100 ease-in-out")}>
                                    <Button variant={"ghost"} size={"sm"}>
                                        < FolderGit2 size={24} />
                                    </Button>
                                </a>
                            </li>
                            <li className="w-full group">
                                <a href="/resume" className={cn(path.includes("/resume") ?
                                    "text-primary" : "text-muted-foreground", "flex flex-col items-center justify-center group-hover:text-primary group-hover:scale-[1.12] duration-100 ease-in-out")}>
                                    <Button variant={"ghost"} size={"sm"}>
                                        <Briefcase size={24} />
                                    </Button>
                                </a>
                            </li>
                            <li className="w-full group">
                                <a href="/travel" className={cn(path.includes("/travel") ?
                                    "text-primary" : "text-muted-foreground", "flex flex-col items-center justify-center group-hover:text-primary group-hover:scale-[1.12] duration-100 ease-in-out")}>
                                    <Button variant={"ghost"} size={"sm"}>
                                        <Globe size={24} />
                                    </Button>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div >
            </div >
        </div >
    )
} 