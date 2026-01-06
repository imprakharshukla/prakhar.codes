"use client";

import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
} from "@prakhar/ui";
import { promptCategories, type PromptCategory } from "@/lib/prompt-categories";
import { XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export type CategoryPromptSelectorProps = {
  onPromptSelect: (prompt: string) => void;
  className?: string;
  categories?: PromptCategory[];
};

export function CategoryPromptSelector({
  onPromptSelect,
  className,
  categories,
}: CategoryPromptSelectorProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const categoriesToUse = categories || promptCategories;

  const selectedCategory = selectedCategoryId
    ? categoriesToUse.find((cat) => cat.id === selectedCategoryId)
    : null;

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleClose = () => {
    setSelectedCategoryId(null);
  };

  const handlePromptClick = (prompt: string) => {
    onPromptSelect(prompt);
    // Optionally reset to category view after selection
    // setSelectedCategoryId(null);
  };

  return (
    <div className={cn("w-full min-h-[300px]", className)}>
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div
            key="categories"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap items-start justify-center gap-x-3 gap-y-2"
          >
            {categoriesToUse.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant="outline"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <Icon className="size-5" />
                  <span>{category.name}</span>
                </Button>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key={`category-${selectedCategoryId}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className=""
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {selectedCategory && (
                    <>
                      <selectedCategory.icon className="size-5" />
                      <CardTitle>{selectedCategory.name}</CardTitle>
                    </>
                  )}
                </div>
                <CardAction>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                  >
                    <XIcon className="size-4" />
                    <span className="sr-only">Lukk</span>
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedCategory?.prompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => handlePromptClick(prompt)}
                  >
                    <span>{prompt}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

