"use client";
import Link from "next/link";
import { useState } from "react";
import ThemeSwitcher from "./theme-switcher";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@prakhar/ui";

export default function Header() {
  const [open, setOpen] = useState(false);
  const links = [{ to: "/", label: "Hjem" }];

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} href={to as any}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default">Få laget ditt eget verktøy</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Lyst på en versjon skreddersydd deg?</DialogTitle>
                <DialogDescription>
                  Yobr lar deg utforske små, konkrete prosjekter innen ny
                  teknologi og KI. Vi fasiliterer prosessen, studentene leverer
                  verdi.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button asChild variant="default">
                  <a
                    href="https://calendly.com/jakob-yobr/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book en prat
                  </a>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* <ThemeSwitcher /> */}
        </div>
      </div>
      <hr />
    </div>
  );
}
