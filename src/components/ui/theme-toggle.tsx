import { Laptop, MoonIcon, SunIcon } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem("theme") ?? "dark";
    } else {
      return "dark"; // Fallback to a default theme if localStorage is not available
    }
  });

  useEffect(() => {
    setIsMounted(true);
    console.log("mounted");
  }, []);

  useEffect(() => {
    if (isMounted && typeof localStorage !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("theme", theme);
    }
  }, [theme, isMounted]);

  if (!isMounted) {
    return <p>Loading</p>;
  }

  return (
    <div className="bg-background lg:fixed absolute top-3 right-3 z-50">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="py-1 px-2 w-fit border-border border-dashed transform duration-200 hover:text-primary text-muted-foreground hover:bg-primary/10 flex gap-2 items-center group border rounded-md bg-card cursor-pointer"
          >
            {theme === "light" ? (
              <SunIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            ) : (
              <MoonIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            )}
            {/* <span className="text-foreground description text-base capitalize">{theme}</span> */}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="dark:border-border/40">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <SunIcon className="mr-2 h-4 w-4" />
            <span>Light</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <MoonIcon className="mr-2 h-4 w-4" />
            <span>Dark</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <Laptop className="mr-2 h-4 w-4" />
            <span>System</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
