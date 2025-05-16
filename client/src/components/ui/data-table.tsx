import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  SortAsc,
  SortDesc,
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Column<T> {
  header: string;
  accessor: ((row: T) => React.ReactNode) | keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  keyField: keyof T;
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
}

function getAccessorValue<T>(row: T, accessor: ((row: T) => React.ReactNode) | keyof T): any {
  if (typeof accessor === 'function') {
    return accessor(row);
  }
  return row[accessor as keyof T];
}

export const DataTable = <T,>({
  data,
  columns,
  onRowClick,
  keyField,
  itemsPerPageOptions = [10, 25, 50, 100],
  defaultItemsPerPage = 10,
  searchable = false,
  searchPlaceholder = "Search...",
  className
}: DataTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof T | null; direction: 'asc' | 'desc' | null }>({
    key: null,
    direction: null
  });

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchQuery]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filteredData = [...data];
    
    // Apply search filter if searchable
    if (searchable && searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter(row => {
        return columns.some(column => {
          const value = getAccessorValue(row, column.accessor);
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(query);
        });
      });
    }
    
    // Apply sorting if configured
    if (sortConfig.key && sortConfig.direction) {
      filteredData.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];
        
        if (aValue === bValue) return 0;
        
        if (sortConfig.direction === 'asc') {
          return aValue < bValue ? -1 : 1;
        } else {
          return aValue > bValue ? -1 : 1;
        }
      });
    }
    
    return filteredData;
  }, [data, columns, searchQuery, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedData.length / itemsPerPage));

  // Handle sort
  const handleSort = (key: keyof T) => {
    setSortConfig(current => {
      if (current.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        } else if (current.direction === 'desc') {
          return { key: null, direction: null };
        } else {
          return { key, direction: 'asc' };
        }
      }
      return { key, direction: 'asc' };
    });
  };

  // Page navigation
  const goToPage = (page: number) => {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(targetPage);
  };

  // Render sort indicator
  const renderSortIndicator = (column: Column<T>) => {
    if (!column.sortable) return null;
    
    const isSorted = typeof column.accessor === 'string' && 
                     sortConfig.key === column.accessor;
    
    if (!isSorted) {
      return <SortAsc className="ml-1 h-4 w-4 text-muted-foreground opacity-30" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <SortAsc className="ml-1 h-4 w-4 text-primary" />
      : <SortDesc className="ml-1 h-4 w-4 text-primary" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and items per page controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        {searchable && (
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        <div className="flex items-center">
          <span className="text-sm text-muted-foreground mr-2">Rows per page:</span>
          <Select 
            value={String(itemsPerPage)}
            onValueChange={(value) => setItemsPerPage(Number(value))}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder={itemsPerPage} />
            </SelectTrigger>
            <SelectContent>
              {itemsPerPageOptions.map(option => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead 
                  key={index}
                  className={`${column.sortable ? 'cursor-pointer select-none' : ''}`}
                  onClick={() => {
                    if (column.sortable && typeof column.accessor === 'string') {
                      handleSort(column.accessor as keyof T);
                    }
                  }}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && renderSortIndicator(column)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <TableRow 
                  key={String(row[keyField])}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                >
                  {columns.map((column, cellIndex) => (
                    <TableCell key={cellIndex}>
                      {column.cell 
                        ? column.cell(row)
                        : getAccessorValue(row, column.accessor)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredAndSortedData.length > 0 ? (
            <>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of{" "}
              {filteredAndSortedData.length} results
            </>
          ) : (
            "No results"
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// This allows both import styles:
// import { DataTable } from '...'
// import DataTable from '...'
export default DataTable;