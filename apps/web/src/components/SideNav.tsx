import { cn } from "@prakhar/ui";
import { HomeIcon, BookAIcon, MailIcon, Briefcase } from "lucide-react";
export default function SideNav({
    className,
    path
}: {
    className?: string
    path: string
}) {
    return (
        <div id="sideNav" className={cn(className, "md:flex fixed top-0 left-0 h-full ml-32 pr-10 bg-card border-r justify-self-center border-border/50 col-span-2 hidden items-center")}>
            <nav className="pt-4 h-full">
                <ul className="flex flex-col items-center h-full justify-center gap-6">
                    <li className="w-full group flex flex-col gap-1 items-center">
                        <a href="/" className={cn(path === "/" ?
                            "text-primary" : "text-muted-foreground", "flex flex-col items-center justify-center group-hover:text-primary group-hover:scale-[1.12] duration-100 ease-in-out")}>
                            <HomeIcon size={24} />
                        </a>
                    </li>
                    <li className="w-full group">
                        <a href="/blog" className={cn(path === "/blog" ?
                            "text-primary" : "text-muted-foreground", "flex flex-col items-center justify-center group-hover:text-primary group-hover:scale-[1.12] duration-100 ease-in-out")}>
                            <BookAIcon size={24} />
                        </a>
                    </li>
                    <li className="w-full">
                        <a href="/contact" className={cn(path === "/contact" ?
                            "text-primary" : "text-muted-foreground", "flex flex-col items-center justify-center group-hover:text-primary group-hover:scale-[1.12] duration-100 ease-in-out")}>
                            <MailIcon size={24} />
                        </a>
                    </li>
                    <li className="w-full">
                        <a href="/contact" className={cn(path === "/contact" ?
                            "text-primary" : "text-muted-foreground", "flex flex-col items-center justify-center group-hover:text-primary group-hover:scale-[1.12] duration-100 ease-in-out")}>
                            <Briefcase size={24} />
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    )
}