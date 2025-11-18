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
      // Ensure header doesn't overlap with status bar
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
    optionsList: {
      paddingHorizontal: 16,
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
    },
    optionText: {
      fontFamily: FONTS.MEDIUM,
      color: COLORS.text,
      fontSize: 14,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 16,
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

  // Local state for temporary selections
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
      setLocalSelections(selectedFilters);

      // Set the first available filter as active
      const firstFilterKey = Object.keys(safeFilterData)[0] as FilterType;
      if (firstFilterKey && safeFilterData[firstFilterKey]?.length > 0) {
        setActiveFilter(firstFilterKey);
      }
    }
  }, [isVisible, selectedFilters, safeFilterData]);

  // Get the value to use for comparison (label for Crops/Seasons, value for others)
  const getComparisonValue = useCallback(
    (filterType: FilterType, option: any): string => {
      return filterType === 'Crops' || filterType === 'Seasons'
        ? option.label
        : option.value.toString();
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

  // Handle option selection
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
          // Single-select for Crops, Years, and Seasons
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

  // Handle clear all
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
    // Apply all selections to parent component
    Object.entries(localSelections).forEach(([filterType, selections]) => {
      onFilterSelect(filterType as FilterType, selections);
    });

    onApply();
    onClose();
  }, [localSelections, onFilterSelect, onApply, onClose]);

  // Render sidebar items
  const renderSidebarItems = useMemo(() => {
    return Object.entries(safeFilterData).map(([key]) => {
      const filterKey = key as FilterType;
      const isActive = activeFilter === filterKey;
      const hasOptions = safeFilterData[filterKey]?.length > 0;

      if (!hasOptions) return null;

      return (
        <Pressable
          key={filterKey}
          style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
          onPress={() => setActiveFilter(filterKey)}
          accessibilityRole="button"
          accessibilityLabel={`Select ${filterKey} filter`}>
          <Text
            style={[
              styles.sidebarItemText,
              isActive && styles.sidebarItemTextActive,
            ]}>
            {t(FILTER_SIDEBAR_LABELS[filterKey])}
          </Text>
        </Pressable>
      );
    });
  }, [safeFilterData, activeFilter, styles, t]);

  // Render options for active filter
  const renderOptions = useMemo(() => {
    if (!activeFilter || !safeFilterData[activeFilter]) return null;

    return safeFilterData[activeFilter].map(option => {
      const isSelected = isOptionSelected(activeFilter, option);

      return (
        <Pressable
          key={option.value.toString()}
          style={styles.optionItem}
          onPress={() => handleOptionSelect(activeFilter, option)}
          accessibilityRole="checkbox"
          accessibilityState={{checked: isSelected}}
          accessibilityLabel={`${isSelected ? 'Deselect' : 'Select'} ${
            option.label
          }`}>
          <Tick color={isSelected ? COLORS.primary : COLORS.placeholder} />
          <Text style={styles.optionText}>{option.label}</Text>
        </Pressable>
      );
    });
  }, [
    activeFilter,
    safeFilterData,
    isOptionSelected,
    handleOptionSelect,
    styles,
  ]);

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
              hitSlop={8}
              style={styles.clearAllButton}
              accessibilityRole="button"
              accessibilityLabel={t(LOCALES.FILTER.BTN_CLEAR_ALL)}>
              <Text style={styles.clearAllText} numberOfLines={1}>
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
                style={styles.optionsList}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{paddingBottom: 20}}>
                {renderOptions}
              </ScrollView>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable
              onPress={onClose}
              style={[styles.footerButton, styles.closeButton]}
              accessibilityRole="button"
              accessibilityLabel={t(LOCALES.FILTER.BTN_CLOSE)}>
              <Text style={[styles.footerButtonText, styles.closeButtonText]}>
                {t(LOCALES.FILTER.BTN_CLOSE)}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleApply}
              style={styles.footerButton}
              accessibilityRole="button"
              accessibilityLabel={t(LOCALES.FILTER.BTN_APPLY)}>
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
