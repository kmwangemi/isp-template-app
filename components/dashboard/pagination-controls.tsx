'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsLabel?: string;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsLabel = 'items',
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t border-border gap-4">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages} ({totalItems} total {itemsLabel})
      </p>
      <div className="flex gap-2 w-full sm:w-auto justify-end">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 flex-1 sm:flex-initial"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 flex-1 sm:flex-initial"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
