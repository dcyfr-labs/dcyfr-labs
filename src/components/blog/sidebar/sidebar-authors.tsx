"use client";

import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface Author {
  id: string;
  name: string;
  avatarImagePath?: string;
}

interface SidebarAuthorsProps {
  authors: Author[];
  selectedAuthor: string;
  isExpanded: boolean;
  onToggle: () => void;
  onAuthorSelect: (authorId: string) => void;
}

/**
 * Sidebar Authors Component
 * 
 * Collapsible section displaying author avatars with counts.
 * Users can click avatars to filter posts by author.
 */
export function SidebarAuthors({
  authors,
  selectedAuthor,
  isExpanded,
  onToggle,
  onAuthorSelect,
}: SidebarAuthorsProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-3">
      <button
        onClick={onToggle}
        className={`flex items-center justify-between w-full ${TYPOGRAPHY.label.small}`}
      >
        <span>Authors</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-2 pt-2">
          <div className="flex flex-wrap gap-2">
            {authors.map((author) => (
              <button
                key={author.id}
                onClick={() => onAuthorSelect(author.id)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-colors select-none ${
                  selectedAuthor === author.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 hover:bg-secondary text-secondary-foreground"
                }`}
                title={author.name}
              >
                <div className="h-6 w-6 rounded-full bg-muted border border-current/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {author.avatarImagePath ? (
                    <Image
                      src={author.avatarImagePath}
                      alt={author.name}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className={TYPOGRAPHY.label.small}>{getInitials(author.name)}</span>
                  )}
                </div>
                <span className={TYPOGRAPHY.label.small}>{author.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
