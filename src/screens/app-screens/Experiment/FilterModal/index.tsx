import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Modal,
  StyleSheet,
  Pressable,
  View,
  ScrollView,
  Text,
  useColorScheme,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {Tick} from '../../../../assets/icons/svgs';
import {FONTS} from '../../../../theme/fonts';
import {LOCALES} from '../../../../localization/constants';

type FilterDataType = {
  Years: {value: number | string; label: string}[];
  Crops: {value: number | string; label: string}[];
  Seasons: {value: string; label: string}[];
  Locations: {value: number | string; label: string}[];
};

type SelectedFiltersType = {
  Seasons: string[];
  Locations: string[];
  Years: string[];
  Crops: string[];
};

type FilterType = 'Seasons' | 'Locations' | 'Years' | 'Crops';

type FilterModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onApply: () => void;
  onClearAll: () => void;
  onFilterSelect: (filterType: FilterType, selectedOptions: string[]) => void;
  filterData: FilterDataType | null;
  selectedFilters: SelectedFiltersType;
};

const FILTER_SIDEBAR_LABELS: Record<FilterType, string> = {
  Seasons: LOCALES.FILTER.LBL_SEASON,
  Locations: LOCALES.FILTER.LBL_LOCATION,
  Years: LOCALES.FILTER.LBL_YEAR,
  Crops: LOCALES.FILTER.LBL_CROP,
};

const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  primary: '#1A6DD2',
  secondary: '#007AFF',
  background: '#F5F5F6',
  border: '#E5E5E5',
  borderDark: '#CCCCCC',
  borderLight: '#999999',
  text: '#000000',
  placeholder: '#D3D3D3',
} as const;

const getStyles = (isDarkMode: boolean, insets: any) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    safeAreaContainer: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 56,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.borderDark,
      backgroundColor: COLORS.white,
      // Proper safe area handling for header
      paddingTop: Math.max(insets.top + 12, 12),
    },
    headerTitle: {
      fontSize: 16,
      fontFamily: FONTS.SEMI_BOLD,
      color: COLORS.text,
      flex: 1,
      textAlign: 'left',
    },
    clearAllButton: {
      paddingLeft: 8,
      paddingVertical: 4,
      paddingHorizontal: 4,
    },
    clearAllText: {
      fontSize: 14,
      fontFamily: FONTS.SEMI_BOLD,
      color: COLORS.secondary,
    },
    contentContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    sidebar: {
      width: '35%',
      backgroundColor: COLORS.background,
    },
    sidebarItem: {
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderBottomWidth: 0.3,
      borderBottomColor: COLORS.borderLight,
    },
    sidebarItemActive: {
      backgroundColor: COLORS.white,
    },
    sidebarItemText: {
      fontSize: 14,
      fontFamily: FONTS.MEDIUM,
      color: COLORS.text,
    },
    sidebarItemTextActive: {
      fontFamily: FONTS.SEMI_BOLD,
    },
    rightContent: {
      flex: 1,
    },
    scrollContainer: {
      flex: 1,
    },
    optionsList: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    optionItem: {
      backgroundColor: COLORS.white,
      paddingVertical: 12,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderBottomWidth: 0.3,
      borderBottomColor: COLORS.border,
      minHeight: 44, // Better touch target
    },
    optionText: {
      fontFamily: FONTS.MEDIUM,
      color: COLORS.text,
      fontSize: 14,
      flex: 1,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 16,
      // Critical fix: Add proper bottom padding to prevent overlap
      paddingBottom: Math.max(insets.bottom + 16, 16),
      borderTopWidth: 0.3,
      borderTopColor: COLORS.border,
      backgroundColor: COLORS.white,
    },
    footerButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 6,
      backgroundColor: COLORS.primary,
      minWidth: 80,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: COLORS.primary,
    },
    footerButtonText: {
      fontSize: 14,
      color: COLORS.white,
      fontFamily: FONTS.MEDIUM,
    },
    closeButtonText: {
      color: COLORS.primary,
    },
    // Loading states and empty states
    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyStateText: {
      fontSize: 16,
      fontFamily: FONTS.MEDIUM,
      color: COLORS.borderLight,
      textAlign: 'center',
    },
  });

const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  onClose,
  onApply,
  onClearAll,
  onFilterSelect,
  filterData,
  selectedFilters,
}) => {
  const {t} = useTranslation();
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => getStyles(isDarkMode, insets),
    [isDarkMode, insets],
  );

  // Safe fallback for filter data
  const safeFilterData: FilterDataType = useMemo(
    () =>
      filterData || {
        Years: [],
        Crops: [],
        Seasons: [],
        Locations: [],
      },
    [filterData],
  );

  // Local state for temporary selections (using consolidated state)
  const [localSelections, setLocalSelections] = useState<SelectedFiltersType>({
    Years: [],
    Crops: [],
    Seasons: [],
    Locations: [],
  });

  const [activeFilter, setActiveFilter] = useState<FilterType | ''>('');

  // Initialize local selections when modal opens
  useEffect(() => {
    if (isVisible) {
      setLocalSelections({
        Years: selectedFilters.Years ? [...selectedFilters.Years] : [],
        Crops: selectedFilters.Crops ? [...selectedFilters.Crops] : [],
        Seasons: selectedFilters.Seasons ? [...selectedFilters.Seasons] : [],
        Locations: selectedFilters.Locations
          ? [...selectedFilters.Locations]
          : [],
      });

      // Set the first available filter with data as active
      const firstKeyWithData = (Object.keys(safeFilterData) as FilterType[])
        .filter(key => safeFilterData[key] && safeFilterData[key].length > 0)
        .shift();

      if (firstKeyWithData) {
        setActiveFilter(firstKeyWithData);
      }
    }
  }, [isVisible, selectedFilters, safeFilterData]);

  // Get the value to use for comparison
  const getComparisonValue = useCallback(
    (filterType: FilterType, option: any): string => {
      // For Seasons and Crops, use label; for others, use value
      const comparisonValue =
        filterType === 'Seasons' || filterType === 'Crops'
          ? option.label
          : option.value.toString();

      return comparisonValue;
    },
    [],
  );

  // Check if an option is selected
  const isOptionSelected = useCallback(
    (filterType: FilterType, option: any): boolean => {
      const comparisonValue = getComparisonValue(filterType, option);
      return localSelections[filterType].includes(comparisonValue);
    },
    [localSelections, getComparisonValue],
  );

  // Handle option selection with proper logic for single vs multi-select
  const handleOptionSelect = useCallback(
    (filterType: FilterType, option: any) => {
      const value = getComparisonValue(filterType, option);

      setLocalSelections(prev => {
        const currentSelections = prev[filterType];
        let newSelections: string[];

        if (
          filterType === 'Crops' ||
          filterType === 'Years' ||
          filterType === 'Seasons'
        ) {
          // Single-select for Crops, Years, and Seasons - toggle on/off
          newSelections = currentSelections.includes(value) ? [] : [value];
        } else {
          // Multi-select for Locations
          newSelections = currentSelections.includes(value)
            ? currentSelections.filter(item => item !== value)
            : [...currentSelections, value];
        }

        return {
          ...prev,
          [filterType]: newSelections,
        };
      });
    },
    [getComparisonValue],
  );

  // Handle clear all filters
  const handleClearAll = useCallback(() => {
    setLocalSelections({
      Years: [],
      Crops: [],
      Seasons: [],
      Locations: [],
    });

    onClearAll();
  }, [onClearAll]);

  // Handle apply filters
  const handleApply = useCallback(() => {
    // Apply all selections to parent component at once
    // Call onFilterSelect for each filter type to update the parent's state
    (Object.entries(localSelections) as [FilterType, string[]][]).forEach(
      ([filterType, selections]) => {
        onFilterSelect(filterType, selections);
      },
    );

    // Wait for state updates to complete, then trigger the API call
    // The onApply callback will trigger the API call with all updated filters
    onApply();
    onClose();
  }, [localSelections, onFilterSelect, onApply, onClose]);

  // Render sidebar items
  const renderSidebarItems = useMemo(() => {
    return (Object.keys(safeFilterData) as FilterType[])
      .filter(key => safeFilterData[key] && safeFilterData[key].length > 0)
      .map(filterKey => {
        const isActive = activeFilter === filterKey;
        const label = t(FILTER_SIDEBAR_LABELS[filterKey]);

        return (
          <Pressable
            key={filterKey}
            style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
            onPress={() => setActiveFilter(filterKey)}
            accessibilityRole="tab"
            accessibilityState={{selected: isActive}}
            accessibilityLabel={t(LOCALES.FILTER.A11Y_SELECT_FILTER, {
              filter: label,
            })}>
            <Text
              style={[
                styles.sidebarItemText,
                isActive && styles.sidebarItemTextActive,
              ]}>
              {label}
            </Text>
          </Pressable>
        );
      });
  }, [safeFilterData, activeFilter, styles, t]);

  // Render options for active filter
  const renderOptions = useMemo(() => {
    if (
      !activeFilter ||
      !safeFilterData[activeFilter] ||
      safeFilterData[activeFilter].length === 0
    ) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            {t(LOCALES.FILTER.MSG_NO_OPTIONS)}
          </Text>
        </View>
      );
    }

    return safeFilterData[activeFilter].map(option => {
      const isSelected = isOptionSelected(activeFilter, option);
      const optionLabel = option.label;
      const optionAccessibilityLabel = isSelected
        ? t(LOCALES.FILTER.A11Y_DESELECT_OPTION, {option: optionLabel})
        : t(LOCALES.FILTER.A11Y_SELECT_OPTION, {option: optionLabel});

      return (
        <Pressable
          key={`${activeFilter}-${option.value.toString()}`}
          style={styles.optionItem}
          onPress={() => handleOptionSelect(activeFilter, option)}
          accessibilityRole="checkbox"
          accessibilityState={{checked: isSelected}}
          accessibilityLabel={optionAccessibilityLabel}>
          <Tick color={isSelected ? COLORS.primary : COLORS.placeholder} />
          <Text style={styles.optionText} numberOfLines={2}>
            {optionLabel}
          </Text>
        </Pressable>
      );
    });
  }, [
    activeFilter,
    safeFilterData,
    isOptionSelected,
    handleOptionSelect,
    styles,
    t,
  ]);

  // Calculate if there are any active selections
  const hasActiveSelections = useMemo(() => {
    return Object.values(localSelections).some(
      selections => selections.length > 0,
    );
  }, [localSelections]);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      statusBarTranslucent={true}
      presentationStyle="fullScreen"
      visible={isVisible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <SafeAreaView style={styles.safeAreaContainer} edges={[]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {t(LOCALES.FILTER.TITLE_FILTERS)}
            </Text>
            <Pressable
              onPress={handleClearAll}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              style={styles.clearAllButton}
              accessibilityRole="button"
              accessibilityState={{disabled: !hasActiveSelections}}
              accessibilityLabel={t(LOCALES.FILTER.A11Y_CLEAR_ALL)}
              disabled={!hasActiveSelections}>
              <Text
                style={[
                  styles.clearAllText,
                  !hasActiveSelections && {opacity: 0.5},
                ]}
                numberOfLines={1}>
                {t(LOCALES.FILTER.BTN_CLEAR_ALL)}
              </Text>
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            {/* Sidebar */}
            <View style={styles.sidebar}>{renderSidebarItems}</View>

            {/* Right content */}
            <View style={styles.rightContent}>
              <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.optionsList}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled">
                {renderOptions}
              </ScrollView>
            </View>
          </View>

          {/* Footer - Fixed to prevent overlap */}
          <View style={styles.footer}>
            <Pressable
              onPress={onClose}
              style={[styles.footerButton, styles.closeButton]}
              accessibilityRole="button"
              accessibilityLabel={t(LOCALES.FILTER.A11Y_CLOSE_MODAL)}>
              <Text style={[styles.footerButtonText, styles.closeButtonText]}>
                {t(LOCALES.FILTER.BTN_CLOSE)}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleApply}
              style={styles.footerButton}
              accessibilityRole="button"
              accessibilityLabel={t(LOCALES.FILTER.A11Y_APPLY_FILTERS)}>
              <Text style={styles.footerButtonText}>
                {t(LOCALES.FILTER.BTN_APPLY)}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default FilterModal;
