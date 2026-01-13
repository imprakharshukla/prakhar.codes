"use client";

import { Laptop, MoonIcon, SunIcon, RssIcon } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@prakhar/ui";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem("theme") ?? "dark";
    } else {
      return "dark";
    }
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && typeof localStorage !== "undefined") {
      if (theme === "system") {
        // Check system preference
        const isDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        if (isDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("theme", theme);
    }
  }, [theme, isMounted]);

  if (!isMounted) {
    return null;
  }

  const getIcon = () => {
    if (theme === "light") {
      return <SunIcon className="h-4 w-4" />;
    } else if (theme === "dark") {
      return <MoonIcon className="h-4 w-4" />;
    } else {
      return <Laptop className="h-4 w-4" />;
    }
  };

  return (
    <div className="lg:fixed absolute top-3 right-3 z-50 flex items-center gap-1">
      <a href="/rss.xml" target="_blank" rel="noopener noreferrer">
        <Button variant="iconButton" size="icon" className="bg-popover">
          <RssIcon className="h-4 w-4" />
        </Button>
      </a>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="iconButton" size="icon" className="bg-popover">
            {getIcon()}
            <span className="text-xs">{theme}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="">
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
