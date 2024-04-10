import { useEffect, useState } from "react"
import { cn } from "../lib/utils"
import { z } from "astro/zod"
import { GitBranch, GitFork, Sparkle, Star, WrapText } from "lucide-react"

const StatZodSchema = z.object({
    name: z.string().default(""),
    stars: z.number().default(0),
    forks: z.number().default(0),
    contributions: z.number().default(0),
    lines_changed: z.number().default(0),
    views: z.number().default(0),
    repos: z.number().default(0),
})
export default function GitHubStatsBentoGrid() {
    const [stats, setStats] = useState<z.infer<typeof StatZodSchema>>()
    const statsURL = "https://raw.githubusercontent.com/imprakharshukla/github-stats/master/generated/overview.json"


    const fetchStats = async () => {
        const res = await fetch(statsURL)
        const data = await res.json()
        console.log(data)
        setStats(data)
    }

    useEffect(() => {
        fetchStats()
    }, [])
    return (
        <div className="grid gap-3 mt-5">
            <div className="grid auto-rows-[120px] grid-cols-3 gap-4">
                {
                    [...Array(4)].map((_, i) => (
                        <div
                            className={cn(
                                "row-span-1 rounded-xl border-2 border-border/40 bg-card text-foreground",
                                i === 1 && "col-span-2",
                                i === 2 && "col-span-2",
                                "hover:border-primary transition-all duration-300 ease-in-out cursor-pointer group"
                            )}
                        >
                            {
                                <GridElement index={i} stats={stats} />
                            }
                        </div>
                    ))
                }
            </div>
        </div>)
}

const GridElement = ({ index, stats }: {
    index: number,
    stats?: z.infer<typeof StatZodSchema>
}) => {
    if (index === 0) {
        return (
            <div className="w-full h-full relative overflow-hidden grid grid-flow-row grid-rows-3 group">
                <div className="flex items-center mt-1">
                    <Star className="text-primary/50 ml-4 group-hover:text-primary" size={20} />
                    <p className="text-base px-3 font-medium text-foreground col-span-1">
                        Stars
                    </p>

                </div>
                <p className="text-2xl lg:text-4xl  absolute bottom-0 left-0  py-2 px-3 before:flex items-end justify-center col-span-2 font-bold text-foreground/90 group-hover:text-4xl group-hover:text-foreground transition-all duration-200 ease-in-out">{
                    stats?.stars.toLocaleString()
                }
                </p>
            </div>
        )
    }
    if (index === 1) {
        return (
            <div className="w-full h-full relative overflow-hidden grid grid-flow-row grid-rows-3 group ">
                <div className="flex items-center mt-1">
                    <GitBranch className="ml-4 text-primary/50 group-hover:text-primary" size={20} />
                    <p className="text-base p-3 font-medium text-foreground col-span-1">
                        Contributions
                    </p>

                </div>

                <p className="text-2xl lg:text-4xl  absolute bottom-0 left-0  py-2 px-3 before:flex items-end justify-center col-span-2 font-bold text-foreground/90 group-hover:text-4xl group-hover:text-foreground transition-all duration-200 ease-in-out">{
                    stats?.contributions.toLocaleString()
                }
                </p>


                {/* <GitBranch className="absolute top-10 left-[100px] lg:left-[200px] p-3 text-primary/5 group-hover:text-primary-60" size={100} /> */}
            </div>
        )
    }
    if (index === 2) {
        return (
            <div className="w-full h-full relative overflow-hidden grid grid-flow-row grid-rows-3 group ">
                <div className="flex items-center mt-1">
                    <WrapText className="text-primary/50 ml-4 group-hover:text-primary" size={20} />
                    <p className="text-base p-3 font-medium text-foreground col-span-1">
                        Line Changes
                    </p>

                </div>
                <p className="text-2xl lg:text-4xl  absolute bottom-0 left-0  py-2 px-3 before:flex items-end justify-center col-span-2 font-bold text-foreground/90 group-hover:text-4xl group-hover:text-foreground transition-all duration-200 ease-in-out">{
                    stats?.lines_changed.toLocaleString()
                }
                </p>

            </div>
        )
    }

    if (index === 3) {
        return (
            <div className="w-full h-full relative overflow-hidden grid grid-flow-row grid-rows-3 group ">
                <div className="flex items-center mt-1">
                    <GitFork className="text-primary/50 ml-4 group-hover:text-primary" size={20} />
                    <p className="text-base p-3 font-medium text-foreground col-span-1">
                        Forks
                    </p>

                </div>
                <p className="text-2xl lg:text-4xl  absolute bottom-0 left-0  py-2 px-3 before:flex items-end justify-center col-span-2 font-bold text-foreground/90 group-hover:text-4xl group-hover:text-foreground transition-all duration-200 ease-in-out">{
                    stats?.forks.toLocaleString()
                }
                </p>
            </div>
        )
    }

}