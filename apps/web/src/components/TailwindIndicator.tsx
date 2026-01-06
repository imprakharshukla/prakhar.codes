import { useEffect, useState } from "react";

export function TailwindIndicator() {
    if (process.env.NODE_ENV === "production") return null;
    const [screenSize, setScreenSize] = useState<{ height: number, width: number }>({ height: window.innerHeight, width: window.innerWidth });

    useEffect(() => {
        function handleResize() {
            setScreenSize({ height: window.innerHeight, width: window.innerWidth });
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty dependency array ensures that this effect runs only once after the initial render

    return (
        <div className="fixed bottom-2 right-2 z-50 flex items-center justify-center rounded-full px-2 py-1 font-mono text-xs bg-background border-border/40 border text-muted-foreground gap-3">
            <div>
                <div className="block sm:hidden">xs</div>
                <div className="hidden sm:block md:hidden">sm</div>
                <div className="hidden md:block lg:hidden">md</div>
                <div className="hidden lg:block xl:hidden">lg</div>
                <div className="hidden xl:block 2xl:hidden">xl</div>
                <div className="hidden 2xl:block">2xl</div>
            </div>
            <div className="">{screenSize.width} x {screenSize.height}</div>
        </div>
    );
}
