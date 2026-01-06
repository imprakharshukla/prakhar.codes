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
  }
  
  export default function FilterDropdown({ setCategory }: FilterDropdownProps) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"outline"} className="text-foreground">
            Filter
            <ListFilter size={20} className="ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border border-border/50">
          {Object.values(Category).map((category) => (
            <DropdownMenuItem onClick={() => setCategory(category)} key={category}>
              {category}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={() => setCategory("All")} key={"all"}>
            All
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }