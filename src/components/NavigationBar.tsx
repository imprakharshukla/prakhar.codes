import { BookAIcon, Briefcase, FolderGit2, HomeIcon, MailIcon } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "./ui"

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
            <div className="backdrop-blur-md bg-background/50 border-t border-border/50 inset-x-0 bottom-0 h-16 md:h-full fixed xs:rounded-t md:border-r md:px-10 md:max-w-[150px]">
                <nav className="pt-4 container h-full">
                    <ul className="flex md:flex-col items-center justify-center md:h-full gap-6 mb-4 md:mb-0 w-full">
                        <li className="w-full group">
                            <a href="/" className={cn(path === "/" ?
                                "text-primary" : "text-muted-foreground", "flex flex-col items-center justify-center group-hover:text-primary group-hover:scale-[1.12] duration-100 ease-in-out")}>
                                <Button variant={"ghost"} size={"sm"}>
                                    < HomeIcon size={24} />
                                </Button>
                            </a>
                        </li>
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
                            <a href="/contact" className={cn(path.includes("/contact") ?
                                "text-primary" : "text-muted-foreground", "flex flex-col items-center justify-center group-hover:text-primary group-hover:scale-[1.12] duration-100 ease-in-out")}>
                                <Button variant={"ghost"} size={"sm"}>
                                    < MailIcon size={24} />
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
                    </ul>
                </nav>
            </div >
        </div >
    )
} 