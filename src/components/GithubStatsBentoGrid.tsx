import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { z } from "astro/zod";
import { GitBranch, GitFork, Sparkle, Star, WrapText } from "lucide-react";

const StatZodSchema = z.object({
    name: z.string().default(""),
    stars: z.number().default(0),
    forks: z.number().default(0),
    contributions: z.number().default(0),
    lines_changed: z.number().default(0),
    views: z.number().default(0),
    repos: z.number().default(0),
});

const gridElements = [
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-primary/80 ml-4 group-hover:text-primary hidden sm:flex icon icon-tabler icons-tabler-filled icon-tabler-star"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" /></svg>,
        label: "Stars",
        value: (stats: z.infer<typeof StatZodSchema>) => stats?.stars.toLocaleString(),
    },
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-primary/80 ml-4 group-hover:text-primary hidden sm:flex icon icon-tabler icons-tabler-outline icon-tabler-git-branch"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M7 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M17 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M7 8l0 8" /><path d="M9 18h6a2 2 0 0 0 2 -2v-5" /><path d="M14 14l3 -3l3 3" /></svg>,
        label: "Contributions",
        value: (stats: z.infer<typeof StatZodSchema>) => stats?.contributions.toLocaleString(),
    },
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-primary/80 ml-4 group-hover:text-primary hidden sm:flex icon icon-tabler icons-tabler-filled icon-tabler-transform"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 14a4 4 0 1 1 -3.995 4.2l-.005 -.2l.005 -.2a4 4 0 0 1 3.995 -3.8z" /><path d="M16.707 2.293a1 1 0 0 1 .083 1.32l-.083 .094l-1.293 1.293h3.586a3 3 0 0 1 2.995 2.824l.005 .176v3a1 1 0 0 1 -1.993 .117l-.007 -.117v-3a1 1 0 0 0 -.883 -.993l-.117 -.007h-3.585l1.292 1.293a1 1 0 0 1 -1.32 1.497l-.094 -.083l-3 -3a.98 .98 0 0 1 -.28 -.872l.036 -.146l.04 -.104c.058 -.126 .14 -.24 .245 -.334l2.959 -2.958a1 1 0 0 1 1.414 0z" /><path d="M3 12a1 1 0 0 1 .993 .883l.007 .117v3a1 1 0 0 0 .883 .993l.117 .007h3.585l-1.292 -1.293a1 1 0 0 1 -.083 -1.32l.083 -.094a1 1 0 0 1 1.32 -.083l.094 .083l3 3a.98 .98 0 0 1 .28 .872l-.036 .146l-.04 .104a1.02 1.02 0 0 1 -.245 .334l-2.959 2.958a1 1 0 0 1 -1.497 -1.32l.083 -.094l1.291 -1.293h-3.584a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-3a1 1 0 0 1 1 -1z" /><path d="M6 2a4 4 0 1 1 -3.995 4.2l-.005 -.2l.005 -.2a4 4 0 0 1 3.995 -3.8z" /></svg>,
        label: "Line Changes",
        value: (stats: z.infer<typeof StatZodSchema>) => stats?.lines_changed.toLocaleString(),
    },
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-primary/80 ml-4 group-hover:text-primary hidden sm:flex icon icon-tabler icons-tabler-outline icon-tabler-git-fork"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M7 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M17 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M7 8v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2 -2v-2" /><path d="M12 12l0 4" /></svg>,
        label: "Forks",
        value: (stats: z.infer<typeof StatZodSchema>) => stats?.forks.toLocaleString(),
    },
];

export default function GitHubStatsBentoGrid({
    headingVisible = false
}: {
    headingVisible?: boolean
}) {
    const [stats, setStats] = useState<z.infer<typeof StatZodSchema>>();
    const statsURL = "https://raw.githubusercontent.com/imprakharshukla/github-stats/master/generated/overview.json";

    const fetchStats = async () => {
        const res = await fetch(statsURL);
        const data = await res.json();
        setStats(data);
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div>
            {headingVisible &&
                <div className="flex gap-3">

                    <h1 className="h3-heading">
                        GitHub Stats
                    </h1>
                    <div className="border border-border/50 px-3 py-1.5 flex rounded-full items-center justify-between gap-3">

                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                        <p className="xs-description">Updated <span className="text-foreground/90">0 0 * * *</span></p>
                    </div>
                </div>
            }
            {stats &&
                <div>
                    <div className="grid gap-3 mt-5">
                        <div className="grid auto-rows-[120px] grid-cols-2 md:grid-cols-3 gap-4">
                            {gridElements.map((element, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "row-span-1 rounded-xl border-2 border-border/40 bg-card text-foreground",
                                        index === 1 && "md:col-span-2",
                                        index === 2 && "md:col-span-2",
                                        "hover:border-primary transition-all duration-300 ease-in-out cursor-pointer group"
                                    )}
                                >
                                    <GridElement {...element} stats={stats} />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            }
        </div>

    );
}

const GridElement = ({ icon, label, value, stats }: {
    icon: JSX.Element,
    label: string,
    value: (stats: z.infer<typeof StatZodSchema>) => string,
    stats: z.infer<typeof StatZodSchema>

}) => (
    <div className="w-full h-full relative overflow-hidden grid grid-flow-row grid-rows-3 group">
        <div className="flex items-center mt-1">
            {icon}
            <p className="text-sm lg:text-base px-3 font-medium text-foreground/90 col-span-1">{label}</p>
        </div>
        <p className="lg:text-2xl text-xl absolute bottom-0 left-0 py-2 px-3 before:flex items-end justify-center col-span-2 
        lg:group-hover:3xl font-bold text-foreground/90 group-hover:text-2xl group-hover:text-foreground transition-all duration-100 linear">
            {value(stats)}
        </p>
    </div>
);
