import React, { useState, useMemo } from 'react';
import { Box, TextField, Typography, InputAdornment, CircularProgress, Paper, Chip, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Checkbox, Stack, Button,  } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { visuallyHidden } from '@mui/utils';

// Define proper interfaces
interface ColumnDefinition<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  cellStyle?: React.CSSProperties;
  renderCell?: (row: T) => React.ReactNode;
}

interface AdminReusableTableProps<T> {
  columns: ColumnDefinition<T>[];
  data: T[];
  title?: string;
  isLoading?: boolean;
  onSearchChange?: (query: string) => void;
  onSearch?: () => void;
  onClearSearch?: () => void;
  searchQuery?: string;
  paginationPerPage?: number;
  paginationRowsPerPageOptions?: number[];
  onRowClick?: (row: T) => void;
  actions?: React.ReactNode;
  enableSelection?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  onExport?: () => void;
  emptyMessage?: string;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  currentPage?: number;
  sx?: any;
}

interface TableToolbarProps {
  title?: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch?: () => void;
  onClearSearch?: () => void;
  selectedCount: number;
  actions?: React.ReactNode;
  onRefresh?: () => void;
  onExport?: () => void;
  enableExport?: boolean;
}

const TableToolbar: React.FC<TableToolbarProps> = ({
  title,
  searchQuery,
  onSearchChange,
  onSearch,
  onClearSearch,
  selectedCount,
  actions,
  onRefresh,
}) => {
  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }}
    >

      {/* Title and Actions Row */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          {title && (
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1F333B', mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {title}
            </Typography>
          )}
          {selectedCount > 0 && (
            <Typography variant="body2" sx={{ color: '#526E78', mt: 0.5, fontWeight: 600 }}>
              {selectedCount} selected
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1}>
          {onRefresh && (
            <IconButton onClick={onRefresh} size="small" sx={{ color: '#1F333B', '&:hover': { color: '#FE8001' } }}>
              <RefreshIcon />
            </IconButton>
          )}

          {actions}
        </Stack>
      </Stack>

      {/* Search and Filters Row */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <TextField
          size="small"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch && onSearch()}
          sx={{
            flex: 1,
            maxWidth: { xs: '100%', sm: 350 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              '& fieldset': { borderColor: '#E2E8F0' },
              '&:hover fieldset': { borderColor: '#FFA033' },
              '&.Mui-focused fieldset': { borderColor: '#FE8001' },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#889EA6' }} />
              </InputAdornment>
            ),
          }}
        />
        {onSearch && (
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={onSearch}
            size="small"
            sx={{
              textTransform: 'none',
              borderRadius: '12px',
              px: 2.5,
              background: 'linear-gradient(135deg, #FE8001 0%, #FFA033 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(254,128,1,0.25)',
              '&:hover': { background: 'linear-gradient(135deg, #E06F00 0%, #FE8001 100%)' }
            }}
          >
            Search
          </Button>
        )}
        {onClearSearch && (
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={onClearSearch}
            disabled={!searchQuery}
            size="small"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 2,
              borderColor: '#94a3b8',
              color: '#64748b',
              '&:hover': {
                borderColor: '#64748b',
                backgroundColor: '#f1f5f9',
              },
              '&:disabled': {
                borderColor: '#e2e8f0',
                color: '#cbd5e1',
              },
            }}
          >
            Clear
          </Button>
        )}
      </Stack>
    </Box>

  );
};

const AdminReusableTable = <T extends Record<string, any>>({
  columns,
  data,
  title,
  isLoading = false,
  onSearchChange,
  onSearch,
  onClearSearch,
  searchQuery = '',
  paginationPerPage = 25,
  
  onRowClick,
  actions,
  enableSelection = false,
  onSelectionChange,
  // enableExport = true,
  onExport,
  emptyMessage = 'No data available',
  totalCount,
  onPageChange,
  currentPage = 0,
  sx = {},
}: AdminReusableTableProps<T>) => {
  
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [page, setPage] = useState(currentPage);
  const [rowsPerPage] = useState(paginationPerPage);
  const [selected, setSelected] = useState<T[]>([]);
  const [orderBy, setOrderBy] = useState<keyof T>();
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  React.useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleSearch = (value: string) => {
    setLocalQuery(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleRequestSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = data;
      setSelected(newSelected);
      if (onSelectionChange) {
        onSelectionChange(newSelected);
      }
      return;
    }
    setSelected([]);
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  };

  const handleClick = (event: React.MouseEvent, row: T) => {
    event.stopPropagation();

    if (!enableSelection) {
      if (onRowClick) {
        onRowClick(row);
      }
      return;
    }

    const selectedIndex = selected.findIndex((item) => {
      if ('id' in item && 'id' in row) {
        return item.id === row.id;
      }
      return false;
    });

    let newSelected: T[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, row);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
    if (onSelectionChange) {
      onSelectionChange(newSelected);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  

  const isSelected = (row: T) => selected.some((item) => {
    if ('id' in item && 'id' in row) {
      return item.id === row.id;
    }
    return false;
  });

  const handleExportCSV = () => {
    if (onExport) {
      onExport();
      return;
    }

    const headers = columns.map(col => col.label);
    const csvRows = data.map(row =>
      columns.map(col => {
        const value = row[col.id as keyof T];
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csv = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title?.toLowerCase().replace(/\s+/g, '_') || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderCell = (row: T, column: ColumnDefinition<T>) => {
    if (column.renderCell) {
      return column.renderCell(row);
    }

    const value = row[column.id as keyof T];

    // Default formatting for status
    if (column.id === 'status') {
      const status = String(value).toLowerCase();
      return (
        <Chip
          label={value}
          size="small"
          sx={{
            backgroundColor:
              status === 'active' ? '#d1fae5' :
                status === 'pending' ? '#fef3c7' :
                  '#f1f5f9',
            color:
              status === 'active' ? '#065f46' :
                status === 'pending' ? '#92400e' :
                  '#64748b',
            fontWeight: 500,
            borderRadius: 1,
          }}
        />
      );
    }

    if (column.id === 'date') {
      try {
        return new Date(value).toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      } catch {
        return value;
      }
    }

    return value;
  };

  const sortedData = useMemo(() => {
    if (!orderBy) return data;

    return [...data].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return order === 'asc'
        ? (aValue < bValue ? -1 : 1)
        : (aValue > bValue ? -1 : 1);
    });
  }, [data, order, orderBy]);

  const paginatedData = useMemo(() => {
    // If totalCount is provided, it means server-side pagination is being used
    // and the data array already contains only the items for the current page
    if (totalCount !== undefined) {
      return sortedData;
    }

    // Otherwise, do client-side pagination
    const start = page * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, page, rowsPerPage, totalCount]);

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        backgroundColor: '#ffffff',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        position: 'relative', // Ensure relative positioning for the absolute loader
        ...sx,
      }}
    >
      <TableToolbar
        title={title}
        searchQuery={localQuery}
        onSearchChange={handleSearch}
        onSearch={onSearch}
        onClearSearch={onClearSearch}
        selectedCount={selected.length}
        actions={actions}
        onExport={handleExportCSV}
      // enableExport={enableExport}
      />

      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="medium">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F1F5F7' }}>
              {enableSelection && (
                <TableCell padding="checkbox" sx={{ width: 60, backgroundColor: '#F1F5F7' }}>
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAllClick}
                    sx={{ color: '#FE8001', '&.Mui-checked': { color: '#FE8001' }, '&.MuiCheckbox-indeterminate': { color: '#FE8001' } }}
                  />
                </TableCell>
              )}

              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || 'left'}
                  sx={{
                    minWidth: column.minWidth,
                    backgroundColor: '#F1F5F7',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    color: '#1F333B',
                    borderBottom: '2px solid #E2E8F0',
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id as keyof T)}
                      sx={{
                        '&.Mui-active': { color: '#FE8001' },
                        '& .MuiTableSortLabel-icon': { color: '#FE8001 !important' }
                      }}
                    >
                      {column.label}
                      {orderBy === column.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.length === 0 && !isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (enableSelection ? 1 : 0)} align="center" sx={{ py: 8 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography color="#889EA6" sx={{ mb: 2, fontWeight: 600 }}>
                      {emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : !isLoading ? (
              paginatedData.map((row, index) => {
                const isItemSelected = isSelected(row);
                const labelId = `table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    key={row.id || index}
                    onClick={(event) => handleClick(event, row)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    selected={isItemSelected}
                    sx={{
                      cursor: onRowClick || enableSelection ? 'pointer' : 'default',
                      '&:hover': {
                        backgroundColor: '#F8FAFC !important',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(254, 128, 1, 0.08) !important',
                        '&:hover': {
                          backgroundColor: 'rgba(254, 128, 1, 0.14) !important',
                        },
                      },
                    }}
                  >
                    {enableSelection && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                          sx={{ color: '#E2E8F0', '&.Mui-checked': { color: '#FE8001' } }}
                        />
                      </TableCell>
                    )}

                    {columns.map((column) => (
                      <TableCell
                        key={String(column.id)}
                        align={column.align || 'left'}
                        sx={{
                          borderBottom: '1px solid #e2e8f0',
                          fontSize: '0.875rem',
                          color: '#475569',
                          ...column.cellStyle,
                        }}
                      >
                        {renderCell(row, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          borderTop: '1px solid #e2e8f0',
          p: { xs: 1.5, sm: 2 },
        }}
      >
        {/* Rows per page dropdown removed */}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#334155' }}>
            {Math.min(page * rowsPerPage + 1, totalCount || data.length)}–
            {Math.min((page + 1) * rowsPerPage, totalCount || data.length)} of{' '}
            {totalCount || data.length}
          </Typography>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              onClick={(e) => handleChangePage(e, 0)}
              disabled={page === 0}
              size="small"
              sx={{
                border: '1px solid #e2e8f0',
                borderRadius: 1,
                '&:hover': { backgroundColor: '#f8fafc' },
                '&.Mui-disabled': { opacity: 0.4 },
              }}
            >
              <FirstPageIcon fontSize="small" />
            </IconButton>

            <IconButton
              onClick={(e) => handleChangePage(e, page - 1)}
              disabled={page === 0}
              size="small"
              sx={{
                border: '1px solid #e2e8f0',
                borderRadius: 1,
                '&:hover': { backgroundColor: '#f8fafc' },
                '&.Mui-disabled': { opacity: 0.4 },
              }}
            >
              <KeyboardArrowLeft fontSize="small" />
            </IconButton>

            <IconButton
              onClick={(e) => handleChangePage(e, page + 1)}
              disabled={page >= Math.ceil((totalCount || data.length) / rowsPerPage) - 1}
              size="small"
              sx={{
                border: '1px solid #e2e8f0',
                borderRadius: 1,
                '&:hover': { backgroundColor: '#f8fafc' },
                '&.Mui-disabled': { opacity: 0.4 },
              }}
            >
              <KeyboardArrowRight fontSize="small" />
            </IconButton>

            <IconButton
              onClick={(e) => handleChangePage(e, Math.ceil((totalCount || data.length) / rowsPerPage) - 1)}
              disabled={page >= Math.ceil((totalCount || data.length) / rowsPerPage) - 1}
              size="small"
              sx={{
                border: '1px solid #e2e8f0',
                borderRadius: 1,
                '&:hover': { backgroundColor: '#f8fafc' },
                '&.Mui-disabled': { opacity: 0.4 },
              }}
            >
              <LastPageIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Loading Overlay - Centered on screen viewport */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute', // Changed from fixed to absolute
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)', // Slightly more transparent
            zIndex: 10, // Higher than table but lower than page elements
            backdropFilter: 'blur(2px)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CircularProgress size={48} sx={{ color: '#FE8001' }} />
            <Typography variant="body2" sx={{ color: '#526E78', fontWeight: 500 }}>
              Loading data...
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export type { ColumnDefinition };
export default AdminReusableTable;
