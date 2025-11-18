/**
 * useExperimentFilter Hook
 * 
 * A custom React hook that provides consistent experiment filtering functionality
 * across all modules. It manages filter state, API calls, and data processing
 * to ensure the same filters return the same data in all screens.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi } from './useApi';
import { URL } from '../constants/URLS';
import {
  ExperimentFilters,
  SelectedFilters,
  Experiment,
  FilterValue,
  buildFilterPayload,
  processExperimentResponse,
  filterExperimentsBySearch,
  getDefaultSelectedFilters,
  validateFilterSelections,
  sortExperiments,
} from '../services/experimentFilterService';
import Toast from '../utilities/toast';

interface UseExperimentFilterOptions {
  autoLoadOnMount?: boolean;
  defaultPerPage?: number;
  enableSearch?: boolean;
  enablePagination?: boolean;
  sortResults?: boolean;
}

interface UseExperimentFilterReturn {
  // Filter options from API
  experimentFilters: ExperimentFilters;
  isLoadingFilters: boolean;
  
  // Selected filters state
  selectedFilters: SelectedFilters;
  updateFilter: (filterType: keyof SelectedFilters, values: string[]) => void;
  applyFilters: () => Promise<void>;
  clearFilters: () => void;
  
  // Selected crop management
  selectedCrop: FilterValue | null;
  selectCrop: (cropLabel: string) => void;
  
  // Experiment data
  experiments: Experiment[];
  totalExperiments: number;
  isLoadingExperiments: boolean;
  
  // Pagination
  currentPage: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredExperiments: Experiment[];
  
  // Error handling
  error: string | null;
  
  // Utility functions
  refreshFilters: () => Promise<void>;
  getCropById: (cropId: number) => FilterValue | undefined;
}

export const useExperimentFilter = (
  options: UseExperimentFilterOptions = {}
): UseExperimentFilterReturn => {
  const {
    autoLoadOnMount = true,
    defaultPerPage = 10,
    enableSearch = true,
    enablePagination = true,
    sortResults = true,
  } = options;

  // API hooks
  const [getFilters, filtersData, isLoadingFilters] = useApi({
    url: URL.GET_FILTERS,
    method: 'GET',
  });

  const [postFiltered, experimentsData, isLoadingExperiments] = useApi({
    url: URL.EXPERIMENT_LIST_FILTERED,
    method: 'POST',
  });

  // State management
  const [experimentFilters, setExperimentFilters] = useState<ExperimentFilters>({
    Years: [],
    Crops: [],
    Seasons: [],
    Locations: [],
  });

  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    Years: [],
    Crops: [],
    Seasons: [],
    Locations: [],
  });

  const [selectedCrop, setSelectedCrop] = useState<FilterValue | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [totalExperiments, setTotalExperiments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load filters on mount
  useEffect(() => {
    if (autoLoadOnMount && !isInitialized) {
      getFilters();
      setIsInitialized(true);
    }
  }, [autoLoadOnMount, getFilters, isInitialized]);

  // Process filter data when received
  useEffect(() => {
    if (filtersData?.status_code === 200 && filtersData.filters) {
      setExperimentFilters(filtersData.filters);
      
      // Set default selections
      const defaults = getDefaultSelectedFilters(filtersData.filters);
      setSelectedFilters(defaults);
      
      // Set default crop
      if (filtersData.filters.Crops.length > 0) {
        setSelectedCrop(filtersData.filters.Crops[0]);
        
        // Auto-load experiments with default filters
        if (autoLoadOnMount) {
          const payload = buildFilterPayload(
            filtersData.filters.Crops[0].value,
            defaults,
            filtersData.filters,
            1,
            defaultPerPage
          );
          
          postFiltered({
            payload,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    } else if (filtersData?.status_code && filtersData.status_code !== 200) {
      setError('Failed to load filter options');
      Toast.error({ message: 'Failed to load filter options' });
    }
  }, [filtersData, autoLoadOnMount, defaultPerPage, postFiltered]);

  // Process experiment data when received
  useEffect(() => {
    if (experimentsData?.status_code === 200) {
      const { experiments: newExperiments, totalCount } = processExperimentResponse(experimentsData);
      
      if (currentPage === 1) {
        // Replace experiments for first page
        const sorted = sortResults ? sortExperiments(newExperiments) : newExperiments;
        setExperiments(sorted);
      } else {
        // Append experiments for subsequent pages
        setExperiments(prev => {
          const combined = [...prev, ...newExperiments];
          return sortResults ? sortExperiments(combined) : combined;
        });
      }
      
      setTotalExperiments(totalCount);
      setError(null);
    } else if (experimentsData?.status_code && experimentsData.status_code !== 200) {
      setError('Failed to load experiments');
      Toast.error({ message: 'Failed to load experiments' });
    }
  }, [experimentsData, currentPage, sortResults]);

  // Update filter selection
  const updateFilter = useCallback(
    (filterType: keyof SelectedFilters, values: string[]) => {
      // Special handling for Crops - only allow single selection
      if (filterType === 'Crops' && values.length > 1) {
        Toast.error({ message: 'Please select only one crop at a time' });
        return;
      }

      setSelectedFilters(prev => {
        const updated = { ...prev, [filterType]: values };
        
        // Update selected crop when Crops filter changes
        if (filterType === 'Crops' && values.length > 0) {
          const crop = experimentFilters.Crops.find(c => c.label === values[0]);
          if (crop) {
            setSelectedCrop(crop);
          }
        }
        
        return validateFilterSelections(updated, experimentFilters);
      });
    },
    [experimentFilters]
  );

  // Apply current filters
  const applyFilters = useCallback(async () => {
    if (!selectedCrop) {
      Toast.error({ message: 'Please select a crop' });
      return;
    }

    setCurrentPage(1);
    setExperiments([]);
    
    const payload = buildFilterPayload(
      selectedCrop.value,
      selectedFilters,
      experimentFilters,
      1,
      defaultPerPage,
      searchQuery
    );

    try {
      await postFiltered({
        payload,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      setError('Failed to apply filters');
      Toast.error({ message: 'Failed to apply filters' });
    }
  }, [selectedCrop, selectedFilters, experimentFilters, searchQuery, defaultPerPage, postFiltered]);

  // Clear all filters to defaults
  const clearFilters = useCallback(() => {
    const defaults = getDefaultSelectedFilters(experimentFilters);
    setSelectedFilters(defaults);
    setSearchQuery('');
    
    // Reset to first crop
    if (experimentFilters.Crops.length > 0) {
      setSelectedCrop(experimentFilters.Crops[0]);
    }
    
    // Apply default filters
    if (experimentFilters.Crops.length > 0) {
      const payload = buildFilterPayload(
        experimentFilters.Crops[0].value,
        defaults,
        experimentFilters,
        1,
        defaultPerPage
      );
      
      postFiltered({
        payload,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }, [experimentFilters, defaultPerPage, postFiltered]);

  // Select crop by label
  const selectCrop = useCallback(
    (cropLabel: string) => {
      const crop = experimentFilters.Crops.find(c => c.label === cropLabel);
      if (!crop) {
        Toast.error({ message: 'Invalid crop selection' });
        return;
      }

      setSelectedCrop(crop);
      setSelectedFilters(prev => ({
        ...prev,
        Crops: [cropLabel],
      }));
      
      // Reset page and clear experiments
      setCurrentPage(1);
      setExperiments([]);
      
      // Apply filters with new crop
      const payload = buildFilterPayload(
        crop.value,
        { ...selectedFilters, Crops: [cropLabel] },
        experimentFilters,
        1,
        defaultPerPage,
        searchQuery
      );
      
      postFiltered({
        payload,
        headers: { 'Content-Type': 'application/json' },
      });
    },
    [experimentFilters, selectedFilters, searchQuery, defaultPerPage, postFiltered]
  );

  // Load more experiments (pagination)
  const loadMore = useCallback(async () => {
    if (!selectedCrop || !enablePagination) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    
    const payload = buildFilterPayload(
      selectedCrop.value,
      selectedFilters,
      experimentFilters,
      nextPage,
      defaultPerPage,
      searchQuery
    );

    try {
      await postFiltered({
        payload,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      setError('Failed to load more experiments');
      Toast.error({ message: 'Failed to load more experiments' });
    }
  }, [selectedCrop, currentPage, selectedFilters, experimentFilters, searchQuery, defaultPerPage, enablePagination, postFiltered]);

  // Refresh filters from API
  const refreshFilters = useCallback(async () => {
    setError(null);
    try {
      await getFilters();
    } catch (err) {
      setError('Failed to refresh filters');
      Toast.error({ message: 'Failed to refresh filters' });
    }
  }, [getFilters]);

  // Get crop by ID
  const getCropById = useCallback(
    (cropId: number): FilterValue | undefined => {
      return experimentFilters.Crops.find(c => Number(c.value) === cropId);
    },
    [experimentFilters]
  );

  // Filter experiments by search query
  const filteredExperiments = useMemo(() => {
    if (!enableSearch || !searchQuery) return experiments;
    return filterExperimentsBySearch(experiments, searchQuery);
  }, [experiments, searchQuery, enableSearch]);

  // Calculate if there are more pages
  const hasMore = useMemo(() => {
    if (!enablePagination) return false;
    return experiments.length < totalExperiments;
  }, [experiments.length, totalExperiments, enablePagination]);

  return {
    // Filter options
    experimentFilters,
    isLoadingFilters,
    
    // Selected filters
    selectedFilters,
    updateFilter,
    applyFilters,
    clearFilters,
    
    // Crop management
    selectedCrop,
    selectCrop,
    
    // Experiment data
    experiments: enableSearch ? filteredExperiments : experiments,
    totalExperiments,
    isLoadingExperiments,
    
    // Pagination
    currentPage,
    hasMore,
    loadMore,
    
    // Search
    searchQuery,
    setSearchQuery,
    filteredExperiments,
    
    // Error handling
    error,
    
    // Utility functions
    refreshFilters,
    getCropById,
  };
};