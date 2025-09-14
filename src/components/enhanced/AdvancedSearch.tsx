// src/components/enhanced/AdvancedSearch.tsx
// Comprehensive search and filtering system

import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../theme/design-system';
import { EnhancedButton } from './EnhancedButton';
import { EnhancedCard } from './EnhancedCard';

export interface SearchFilter {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'range' | 'boolean';
  options?: { value: string; label: string }[];
  value: any;
  placeholder?: string;
}

export interface SearchResult<T = any> {
  items: T[];
  totalCount: number;
  facets?: { [key: string]: { [value: string]: number } };
}

interface AdvancedSearchProps<T = any> {
  data: T[];
  onSearch: (query: string, filters: SearchFilter[]) => SearchResult<T>;
  onResultSelect?: (item: T) => void;
  filters?: SearchFilter[];
  placeholder?: string;
  showResultCount?: boolean;
  enableVoiceSearch?: boolean;
  enableSaveSearch?: boolean;
  recentSearches?: string[];
  suggestions?: string[];
  renderResult: (item: T, index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  debounceMs?: number;
}

export const AdvancedSearch = <T,>({
  data,
  onSearch,
  onResultSelect,
  filters = [],
  placeholder = 'Search...',
  showResultCount = true,
  enableVoiceSearch = false,
  enableSaveSearch = false,
  recentSearches = [],
  suggestions = [],
  renderResult,
  renderEmpty,
  debounceMs = 300,
}: AdvancedSearchProps<T>) => {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>(filters);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(recentSearches);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult<T>>({ items: [], totalCount: 0 });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query || activeFilters.some(f => f.value)) {
        performSearch();
      } else {
        setResults({ items: [], totalCount: 0 });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, activeFilters]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const searchResults = onSearch(query, activeFilters);
      setResults(searchResults);

      // Add to search history if query is not empty
      if (query.trim() && !searchHistory.includes(query.trim())) {
        const newHistory = [query.trim(), ...searchHistory.slice(0, 9)];
        setSearchHistory(newHistory);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults({ items: [], totalCount: 0 });
    } finally {
      setIsSearching(false);
    }
  };

  const updateFilter = (filterId: string, value: any) => {
    setActiveFilters(prev =>
      prev.map(filter => (filter.id === filterId ? { ...filter, value } : filter))
    );
  };

  const clearFilters = () => {
    setActiveFilters(filters.map(f => ({ ...f, value: null })));
  };

  const clearSearch = () => {
    setQuery('');
    setResults({ items: [], totalCount: 0 });
  };

  const renderFilterInput = (filter: SearchFilter) => {
    switch (filter.type) {
      case 'text':
        return (
          <TextInput
            style={styles.filterInput}
            value={filter.value || ''}
            onChangeText={value => updateFilter(filter.id, value)}
            placeholder={filter.placeholder || filter.label}
            placeholderTextColor={colors.text.tertiary}
          />
        );

      case 'select':
        return (
          <View style={styles.selectContainer}>
            {filter.options?.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.selectOption,
                  filter.value === option.value && styles.selectOptionActive,
                ]}
                onPress={() =>
                  updateFilter(filter.id, filter.value === option.value ? null : option.value)
                }
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    filter.value === option.value && styles.selectOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'multiselect':
        return (
          <View style={styles.multiselectContainer}>
            {filter.options?.map(option => {
              const isSelected = Array.isArray(filter.value) && filter.value.includes(option.value);

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.multiselectOption, isSelected && styles.multiselectOptionActive]}
                  onPress={() => {
                    const currentValues = Array.isArray(filter.value) ? filter.value : [];
                    const newValues = isSelected
                      ? currentValues.filter(v => v !== option.value)
                      : [...currentValues, option.value];
                    updateFilter(filter.id, newValues.length > 0 ? newValues : null);
                  }}
                >
                  <Text
                    style={[
                      styles.multiselectOptionText,
                      isSelected && styles.multiselectOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case 'boolean':
        return (
          <TouchableOpacity
            style={[styles.booleanToggle, filter.value && styles.booleanToggleActive]}
            onPress={() => updateFilter(filter.id, !filter.value)}
          >
            <View
              style={[styles.booleanIndicator, filter.value && styles.booleanIndicatorActive]}
            />
            <Text style={styles.booleanLabel}>{filter.label}</Text>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  const hasActiveFilters = useMemo(
    () => activeFilters.some(f => f.value !== null && f.value !== undefined && f.value !== ''),
    [activeFilters]
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={placeholder}
            placeholderTextColor={colors.text.tertiary}
            returnKeyType="search"
            onSubmitEditing={performSearch}
          />

          {/* Search Actions */}
          <View style={styles.searchActions}>
            {query.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}

            {enableVoiceSearch && (
              <TouchableOpacity style={styles.voiceButton}>
                <Text style={styles.voiceButtonText}>🎤</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Toggle */}
        {filters.length > 0 && (
          <TouchableOpacity
            style={[
              styles.filterToggle,
              (isFiltersVisible || hasActiveFilters) && styles.filterToggleActive,
            ]}
            onPress={() => setIsFiltersVisible(!isFiltersVisible)}
          >
            <Text
              style={[
                styles.filterToggleText,
                (isFiltersVisible || hasActiveFilters) && styles.filterToggleTextActive,
              ]}
            >
              Filters {hasActiveFilters && `(${activeFilters.filter(f => f.value).length})`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters Panel */}
      {isFiltersVisible && (
        <EnhancedCard variant="outlined" padding={4} style={styles.filtersPanel}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filters</Text>
            {hasActiveFilters && (
              <EnhancedButton title="Clear All" onPress={clearFilters} variant="ghost" size="sm" />
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersList}>
              {activeFilters.map(filter => (
                <View key={filter.id} style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>{filter.label}</Text>
                  {renderFilterInput(filter)}
                </View>
              ))}
            </View>
          </ScrollView>
        </EnhancedCard>
      )}

      {/* Search Suggestions / Recent Searches */}
      {query.length === 0 && searchHistory.length > 0 && (
        <EnhancedCard variant="outlined" padding={3} style={styles.suggestionsPanel}>
          <Text style={styles.suggestionsTitle}>Recent Searches</Text>
          <View style={styles.suggestionsList}>
            {searchHistory.slice(0, 5).map((search, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => setQuery(search)}
              >
                <Text style={styles.suggestionText}>🕐 {search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </EnhancedCard>
      )}

      {/* Results */}
      <View style={styles.resultsContainer}>
        {showResultCount && (results.totalCount > 0 || query || hasActiveFilters) && (
          <View style={styles.resultHeader}>
            <Text style={styles.resultCount}>
              {isSearching
                ? 'Searching...'
                : results.totalCount === 0
                ? 'No results found'
                : `${results.totalCount} result${results.totalCount !== 1 ? 's' : ''} found`}
            </Text>
          </View>
        )}

        <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
          {results.items.length > 0
            ? results.items.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => onResultSelect?.(item)}
                  activeOpacity={0.7}
                >
                  {renderResult(item, index)}
                </TouchableOpacity>
              ))
            : (query || hasActiveFilters) &&
              !isSearching &&
              (renderEmpty ? (
                renderEmpty()
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No results found</Text>
                  <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
                </View>
              ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  searchContainer: {
    padding: spacing[4],
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },

  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    minHeight: 48,
    marginBottom: spacing[3],
  },

  searchInput: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    paddingVertical: spacing[2],
  },

  searchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },

  clearButton: {
    padding: spacing[1],
  },

  clearButtonText: {
    fontSize: typography.sizes.lg,
    color: colors.text.secondary,
  },

  voiceButton: {
    padding: spacing[1],
  },

  voiceButtonText: {
    fontSize: typography.sizes.lg,
  },

  filterToggle: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
  },

  filterToggleActive: {
    backgroundColor: colors.primary[100],
  },

  filterToggleText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500' as const,
    color: colors.text.secondary,
  },

  filterToggleTextActive: {
    color: colors.primary[700],
  },

  filtersPanel: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
  },

  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },

  filterTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },

  filtersList: {
    flexDirection: 'row',
    gap: spacing[4],
  },

  filterGroup: {
    minWidth: 200,
  },

  filterLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '500' as const,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },

  filterInput: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    backgroundColor: colors.background,
  },

  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },

  selectOption: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: 'transparent',
  },

  selectOptionActive: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[300],
  },

  selectOptionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },

  selectOptionTextActive: {
    color: colors.primary[700],
    fontWeight: '500' as const,
  },

  multiselectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },

  multiselectOption: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: 'transparent',
  },

  multiselectOptionActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },

  multiselectOptionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },

  multiselectOptionTextActive: {
    color: colors.text.inverse,
    fontWeight: '500' as const,
  },

  booleanToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },

  booleanToggleActive: {
    opacity: 0.8,
  },

  booleanIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gray[200],
    borderWidth: 2,
    borderColor: colors.gray[300],
  },

  booleanIndicatorActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },

  booleanLabel: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },

  suggestionsPanel: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
  },

  suggestionsTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '500' as const,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },

  suggestionsList: {
    gap: spacing[1],
  },

  suggestionItem: {
    paddingVertical: spacing[2],
  },

  suggestionText: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },

  resultsContainer: {
    flex: 1,
  },

  resultHeader: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },

  resultCount: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: '500' as const,
  },

  resultsList: {
    flex: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[12],
  },

  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: '500' as const,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },

  emptySubtext: {
    fontSize: typography.sizes.base,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default AdvancedSearch;
