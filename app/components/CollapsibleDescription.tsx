"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapsibleDescriptionProps {
  description: string;
  title: string;
}

export default function CollapsibleDescription({
  description,
  title,
}: CollapsibleDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Clean and format the description
  const cleanDescription = description
    .replace(/<p><\/p>/g, "<br>")
    .replace(/<p>/g, "")
    .replace(/<\/p>/g, "<br>")
    .trim();

  const paragraphs = cleanDescription.split(/\n{2,}/).filter((p) => p.trim());

  return (
    <div className="mt-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleExpanded}
        className="flex items-center gap-2 p-2 h-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
        {isExpanded ? "Hide Description" : "Show Description"}
      </Button>

      {isExpanded && (
        <div className="mt-2 p-4 bg-muted/30 dark:bg-muted/20 border border-muted-foreground/20 rounded-lg transition-all duration-200 ease-in-out">
          <div className="space-y-3">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <div
                  key={index}
                  className="text-sm leading-relaxed text-foreground/90"
                  dangerouslySetInnerHTML={{
                    __html: paragraph.replace(/<br>/g, "<br />"),
                  }}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No description available
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
