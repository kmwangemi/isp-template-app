'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface FilterConfig {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: { label: string; value: string }[];
}

interface SearchFilterControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
}

export function SearchFilterControls({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
}: SearchFilterControlsProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 w-full">
      <div className="relative flex-1 w-full flex items-center">
        <Search className="w-4 h-4 text-muted-foreground absolute ml-3" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-background border-border pl-10 w-full"
        />
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto shrink-0">
          {filters.map((filter, index) => (
            <Select
              key={index}
              value={filter.value}
              onValueChange={filter.onValueChange}
            >
              <SelectTrigger className="w-full md:w-44 bg-card border-border">
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}
    </div>
  );
}
