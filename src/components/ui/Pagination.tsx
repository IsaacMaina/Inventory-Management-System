import { Button } from './Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50]
}: PaginationProps) => {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    pages.push(1);
    
    // Calculate which pages to show in the middle
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust if we have room to show more pages
    if (endPage - startPage + 3 < maxVisiblePages) {
      const remaining = maxVisiblePages - (endPage - startPage + 3);
      startPage = Math.max(2, startPage - Math.floor(remaining / 2));
      endPage = Math.min(totalPages - 1, endPage + Math.ceil(remaining / 2));
    }
    
    // Add ellipsis before middle pages if needed
    if (startPage > 2) {
      pages.push(-1); // -1 represents ellipsis
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }
    
    // Add ellipsis after middle pages if needed
    if (endPage < totalPages - 1) {
      pages.push(-1); // -1 represents ellipsis
    }
    
    // Always show last page if there are more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages.map((page, index) => (
      <Button
        key={index}
        variant={page === currentPage ? 'default' : 'outline'}
        size="sm"
        onClick={() => page > 0 && onPageChange(page)}
        disabled={page === -1 || page === currentPage}
        className={page === -1 ? 'cursor-default' : ''}
      >
        {page === -1 ? <MoreHorizontal className="h-4 w-4" /> : page}
      </Button>
    ));
  };

  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{totalItems}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Rows per page:</span>
          <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-400">
        Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
        <span className="font-medium">
          {Math.min(currentPage * pageSize, totalItems)}
        </span>{' '}
        of <span className="font-medium">{totalItems}</span> results
      </p>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-400">Rows per page:</span>
        <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger className="w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex space-x-1 ml-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {renderPageNumbers()}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!canGoNext}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};