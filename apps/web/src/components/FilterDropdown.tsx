import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Button
  } from "@prakhar/ui";
  import { ListFilter } from "lucide-react";
  import { Category } from "../types";

  type FilterDropdownProps = {
    setCategory: (category: Category | "All") => void;
    activeCategory: Category | "All";
    categoryCounts: Record<string, number>;
  }

  export default function FilterDropdown({ setCategory, activeCategory, categoryCounts }: FilterDropdownProps) {
    const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"outline"} className="text-foreground gap-2">
            <ListFilter size={16} />
            {activeCategory !== "All" ? (
              <span className="text-primary bg-primary/20 px-1.5 py-0.5 rounded font-medium text-xs">{activeCategory}</span>
            ) : (
              <span>Filter</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px] border border-border/50">
          <DropdownMenuItem onClick={() => setCategory("All")} key={"all"} className="flex items-center justify-between">
            <span>All</span>
            <span className="text-primary bg-primary/20 px-1.5 py-0.5 rounded font-medium text-xs">{total}</span>
          </DropdownMenuItem>
          {Object.entries(categoryCounts).map(([category, count]) => (
            <DropdownMenuItem onClick={() => setCategory(category as Category)} key={category} className="flex items-center justify-between">
              <span>{category}</span>
              <span className="text-primary bg-primary/20 px-1.5 py-0.5 rounded font-medium text-xs">{count}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
