// src/components/enhanced/EnhancedTable.tsx
// Advanced table component with sorting, pagination, and selection

import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../theme/design-system';
import { EnhancedButton } from './EnhancedButton';
import { EnhancedCard } from './EnhancedCard';

export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: T, index: number) => React.ReactNode;
  filterType?: 'text' | 'select' | 'date' | 'number';
  filterOptions?: { value: any; label: string }[];
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T, index: number) => string;
  loading?: boolean;
  selectable?: boolean;
  multiSelect?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
  pagination?: {
    enabled: boolean;
    pageSize?: number;
    showPageInfo?: boolean;
    showPageSizeSelector?: boolean;
    pageSizeOptions?: number[];
  };
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  stickyHeader?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  dense?: boolean;
  actions?: {
    title: string;
    icon?: string;
    onPress: (item: T) => void;
    variant?: 'primary' | 'secondary' | 'error' | 'success';
    visible?: (item: T) => boolean;
  }[];
  onRowPress?: (item: T, index: number) => void;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig<T> {
  key: keyof T | string;
  direction: SortDirection;
}

export const EnhancedTable = <T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  loading = false,
  selectable = false,
  multiSelect = false,
  onSelectionChange,
  pagination = { enabled: false, pageSize: 10 },
  searchable = false,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data available',
  stickyHeader = true,
  striped = true,
  hoverable = true,
  dense = false,
  actions = [],
  onRowPress,
}: TableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination.pageSize || 10);
  const [searchQuery, setSearchQuery] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(item =>
        Object.values(item).some(value => String(value).toLowerCase().includes(query))
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([columnKey, filterValue]) => {
      if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
        result = result.filter(item => {
          const itemValue = item[columnKey as keyof T];
          if (Array.isArray(filterValue)) {
            return filterValue.includes(itemValue);
          }
          return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
        });
      }
    });

    return result;
  }, [data, searchQuery, columnFilters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination.enabled) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, pagination.enabled]);

  const totalPages = pagination.enabled ? Math.ceil(sortedData.length / pageSize) : 1;

  const handleSort = (columnKey: keyof T | string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    setSortConfig(prevSort => {
      if (prevSort?.key === columnKey) {
        if (prevSort.direction === 'asc') {
          return { key: columnKey, direction: 'desc' };
        } else if (prevSort.direction === 'desc') {
          return null;
        }
      }
      return { key: columnKey, direction: 'asc' };
    });
  };

  const handleRowSelection = (item: T, itemKey: string) => {
    if (!selectable) return;

    const newSelectedItems = new Set(selectedItems);

    if (multiSelect) {
      if (newSelectedItems.has(itemKey)) {
        newSelectedItems.delete(itemKey);
      } else {
        newSelectedItems.add(itemKey);
      }
    } else {
      if (newSelectedItems.has(itemKey)) {
        newSelectedItems.clear();
      } else {
        newSelectedItems.clear();
        newSelectedItems.add(itemKey);
      }
    }

    setSelectedItems(newSelectedItems);

    const selectedData = data.filter((item, index) =>
      newSelectedItems.has(keyExtractor(item, index))
    );
    onSelectionChange?.(selectedData);
  };

  const handleSelectAll = () => {
    if (!multiSelect) return;

    const allKeys = new Set(paginatedData.map((item, index) => keyExtractor(item, index)));
    const allSelected = [...allKeys].every(key => selectedItems.has(key));

    if (allSelected) {
      // Deselect all visible items
      const newSelectedItems = new Set(selectedItems);
      allKeys.forEach(key => newSelectedItems.delete(key));
      setSelectedItems(newSelectedItems);
    } else {
      // Select all visible items
      const newSelectedItems = new Set([...selectedItems, ...allKeys]);
      setSelectedItems(newSelectedItems);
    }

    const selectedData = data.filter((item, index) => selectedItems.has(keyExtractor(item, index)));
    onSelectionChange?.(selectedData);
  };

  const updateColumnFilter = (columnKey: string, value: any) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value,
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const renderSortIcon = (columnKey: keyof T | string) => {
    if (sortConfig?.key !== columnKey) {
      return <Text style={styles.sortIcon}>↕</Text>;
    }
    return <Text style={styles.sortIconActive}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</Text>;
  };

  const renderColumnFilter = (column: TableColumn<T>) => {
    if (!column.filterable) return null;

    const filterValue = columnFilters[column.key as string] || '';

    switch (column.filterType) {
      case 'select':
        return (
          <View style={styles.filterSelectContainer}>
            {column.filterOptions?.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  filterValue === option.value && styles.filterOptionActive,
                ]}
                onPress={() =>
                  updateColumnFilter(
                    column.key as string,
                    filterValue === option.value ? '' : option.value
                  )
                }
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterValue === option.value && styles.filterOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      default:
        return (
          <TextInput
            style={styles.columnFilter}
            value={filterValue}
            onChangeText={value => updateColumnFilter(column.key as string, value)}
            placeholder={`Filter ${column.title.toLowerCase()}...`}
            placeholderTextColor={colors.text.tertiary}
          />
        );
    }
  };

  if (loading) {
    return (
      <EnhancedCard style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </EnhancedCard>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      {searchable && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.text.tertiary}
          />
        </View>
      )}

      {/* Selection Info */}
      {selectable && selectedItems.size > 0 && (
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
          </Text>
          <EnhancedButton
            title="Clear"
            onPress={() => {
              setSelectedItems(new Set());
              onSelectionChange?.([]);
            }}
            variant="ghost"
            size="sm"
          />
        </View>
      )}

      {/* Table */}
      <EnhancedCard variant="outlined" padding={0} style={styles.tableContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.table}>
            {/* Header */}
            <View style={[styles.tableHeader, stickyHeader && styles.stickyHeader]}>
              {selectable && multiSelect && (
                <View style={[styles.headerCell, styles.checkboxCell]}>
                  <TouchableOpacity onPress={handleSelectAll} style={styles.checkbox}>
                    <View
                      style={[
                        styles.checkboxInner,
                        paginatedData.length > 0 &&
                          [...paginatedData.map((item, index) => keyExtractor(item, index))].every(
                            key => selectedItems.has(key)
                          ) &&
                          styles.checkboxActive,
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              )}

              {columns.map(column => (
                <View
                  key={column.key as string}
                  style={[
                    styles.headerCell,
                    column.width && { width: column.width },
                    column.minWidth && { minWidth: column.minWidth },
                    column.maxWidth && { maxWidth: column.maxWidth },
                    column.align === 'center' && styles.centerAlign,
                    column.align === 'right' && styles.rightAlign,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => handleSort(column.key)}
                    disabled={!column.sortable}
                  >
                    <Text style={styles.headerText}>{column.title}</Text>
                    {column.sortable && renderSortIcon(column.key)}
                  </TouchableOpacity>

                  {/* Column Filter */}
                  {column.filterable && renderColumnFilter(column)}
                </View>
              ))}

              {actions.length > 0 && (
                <View style={[styles.headerCell, styles.actionsCell]}>
                  <Text style={styles.headerText}>Actions</Text>
                </View>
              )}
            </View>

            {/* Body */}
            <View style={styles.tableBody}>
              {paginatedData.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>{emptyMessage}</Text>
                </View>
              ) : (
                paginatedData.map((item, index) => {
                  const itemKey = keyExtractor(item, index);
                  const isSelected = selectedItems.has(itemKey);
                  const globalIndex = pagination.enabled
                    ? (currentPage - 1) * pageSize + index
                    : index;

                  return (
                    <TouchableOpacity
                      key={itemKey}
                      style={[
                        styles.tableRow,
                        striped && index % 2 === 0 && styles.stripedRow,
                        isSelected && styles.selectedRow,
                        hoverable && styles.hoverableRow,
                        dense && styles.denseRow,
                      ]}
                      onPress={() => {
                        if (selectable) {
                          handleRowSelection(item, itemKey);
                        } else {
                          onRowPress?.(item, globalIndex);
                        }
                      }}
                      activeOpacity={hoverable ? 0.7 : 1}
                    >
                      {selectable && multiSelect && (
                        <View style={[styles.cell, styles.checkboxCell]}>
                          <TouchableOpacity
                            onPress={() => handleRowSelection(item, itemKey)}
                            style={styles.checkbox}
                          >
                            <View
                              style={[styles.checkboxInner, isSelected && styles.checkboxActive]}
                            />
                          </TouchableOpacity>
                        </View>
                      )}

                      {columns.map(column => (
                        <View
                          key={column.key as string}
                          style={[
                            styles.cell,
                            column.width && { width: column.width },
                            column.minWidth && { minWidth: column.minWidth },
                            column.maxWidth && { maxWidth: column.maxWidth },
                            column.align === 'center' && styles.centerAlign,
                            column.align === 'right' && styles.rightAlign,
                          ]}
                        >
                          {column.render ? (
                            column.render(item[column.key], item, globalIndex)
                          ) : (
                            <Text style={styles.cellText} numberOfLines={2}>
                              {String(item[column.key] || '')}
                            </Text>
                          )}
                        </View>
                      ))}

                      {actions.length > 0 && (
                        <View style={[styles.cell, styles.actionsCell]}>
                          <View style={styles.actions}>
                            {actions
                              .filter(action => action.visible?.(item) !== false)
                              .map((action, actionIndex) => (
                                <EnhancedButton
                                  key={actionIndex}
                                  title={action.title}
                                  onPress={() => action.onPress(item)}
                                  variant={action.variant || 'secondary'}
                                  size="sm"
                                />
                              ))}
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>
      </EnhancedCard>

      {/* Pagination */}
      {pagination.enabled && totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <View style={styles.paginationInfo}>
            {pagination.showPageInfo && (
              <Text style={styles.paginationText}>
                Page {currentPage} of {totalPages} ({sortedData.length} total)
              </Text>
            )}
          </View>

          <View style={styles.paginationControls}>
            <EnhancedButton
              title="Previous"
              onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant="secondary"
              size="sm"
            />

            <View style={styles.pageNumbers}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum =
                  currentPage <= 3
                    ? i + 1
                    : currentPage >= totalPages - 2
                    ? totalPages - 4 + i
                    : currentPage - 2 + i;

                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <EnhancedButton
                    key={pageNum}
                    title={String(pageNum)}
                    onPress={() => setCurrentPage(pageNum)}
                    variant={pageNum === currentPage ? 'primary' : 'ghost'}
                    size="sm"
                  />
                );
              })}
            </View>

            <EnhancedButton
              title="Next"
              onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              variant="secondary"
              size="sm"
            />
          </View>

          {pagination.showPageSizeSelector && (
            <View style={styles.pageSizeSelector}>
              <Text style={styles.pageSizeLabel}>Show:</Text>
              {(pagination.pageSizeOptions || [10, 25, 50, 100]).map(size => (
                <EnhancedButton
                  key={size}
                  title={String(size)}
                  onPress={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  variant={size === pageSize ? 'primary' : 'ghost'}
                  size="sm"
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  searchContainer: {
    padding: spacing[4],
  },

  searchInput: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },

  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.primary[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[100],
  },

  selectionText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500' as const,
    color: colors.primary[700],
  },

  tableContainer: {
    flex: 1,
    margin: spacing[4],
  },

  table: {
    minWidth: '100%',
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    borderBottomWidth: 2,
    borderBottomColor: colors.gray[200],
  },

  stickyHeader: {
    // Note: React Native doesn't support position: sticky
    // This would need to be implemented with additional logic
  },

  tableBody: {
    backgroundColor: colors.background,
  },

  headerCell: {
    flex: 1,
    minWidth: 120,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[4],
    borderRightWidth: 1,
    borderRightColor: colors.gray[200],
  },

  checkboxCell: {
    flex: 0,
    minWidth: 50,
    alignItems: 'center',
  },

  actionsCell: {
    flex: 0,
    minWidth: 150,
  },

  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },

  sortIcon: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginLeft: spacing[1],
  },

  sortIconActive: {
    fontSize: typography.sizes.sm,
    color: colors.primary[600],
    marginLeft: spacing[1],
  },

  columnFilter: {
    marginTop: spacing[2],
    backgroundColor: colors.background,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },

  filterSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
    marginTop: spacing[2],
  },

  filterOption: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: 'transparent',
  },

  filterOptionActive: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[300],
  },

  filterOptionText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },

  filterOptionTextActive: {
    color: colors.primary[700],
    fontWeight: '500' as const,
  },

  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },

  stripedRow: {
    backgroundColor: colors.gray[25],
  },

  selectedRow: {
    backgroundColor: colors.primary[50],
  },

  hoverableRow: {
    // Hover effects would be handled by TouchableOpacity
  },

  denseRow: {
    // Reduced padding for dense tables
  },

  cell: {
    flex: 1,
    minWidth: 120,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderRightWidth: 1,
    borderRightColor: colors.gray[100],
    justifyContent: 'center',
  },

  cellText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },

  centerAlign: {
    alignItems: 'center',
  },

  rightAlign: {
    alignItems: 'flex-end',
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.gray[300],
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: 'transparent',
    borderRadius: 2,
  },

  checkboxActive: {
    backgroundColor: colors.primary[600],
  },

  actions: {
    flexDirection: 'row',
    gap: spacing[2],
    flexWrap: 'wrap',
  },

  emptyContainer: {
    paddingVertical: spacing[8],
    alignItems: 'center',
  },

  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
  },

  loadingText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },

  paginationContainer: {
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.gray[25],
  },

  paginationInfo: {
    alignItems: 'center',
    marginBottom: spacing[3],
  },

  paginationText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },

  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },

  pageNumbers: {
    flexDirection: 'row',
    gap: spacing[1],
  },

  pageSizeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
  },

  pageSizeLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
});

export default EnhancedTable;
