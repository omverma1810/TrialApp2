import React from 'react';
import {View, Pressable, StyleSheet, ScrollView} from 'react-native';
import {Text} from '..';
import useTheme from '../../theme/hooks/useTheme';
import {ProtocolQuickFiltersProps} from '../../types/components/AgronomyProtocol';

/**
 * ProtocolQuickFilters Component
 *
 * Provides quick filter buttons for protocol tasks based on their status.
 * Allows users to filter by: All, Pending, Due Soon, and Overdue.
 *
 * @component
 * @example
 * <ProtocolQuickFilters
 *   selectedFilter="all"
 *   onFilterChange={(filter) => }
 * />
 */
const ProtocolQuickFilters: React.FC<ProtocolQuickFiltersProps> = ({
  selectedFilter,
  onFilterChange,
}) => {
  const {COLORS, FONTS} = useTheme();

  const filters: Array<{
    key: 'all' | 'pending' | 'due_soon' | 'overdue';
    label: string;
  }> = [
    {key: 'all', label: 'All'},
    {key: 'pending', label: 'Pending'},
    {key: 'due_soon', label: 'Due Soon'},
    {key: 'overdue', label: 'Overdue'},
  ];

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: COLORS.COMPONENTS.INPUT.BACKGROUND_COLOR},
      ]}>
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              fontFamily: FONTS.SEMI_BOLD,
              color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
            },
          ]}>
          ⚡ Quick Filters
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}>
        {filters.map(filter => {
          const isSelected = selectedFilter === filter.key;
          return (
            <Pressable
              key={filter.key}
              style={[
                styles.filterButton,
                {
                  backgroundColor: isSelected
                    ? COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR
                    : 'transparent',
                  borderColor: isSelected
                    ? COLORS.COMPONENTS.BUTTON.PRIMARY_COLOR
                    : COLORS.COMPONENTS.INPUT.INACTIVE_BORDER_COLOR,
                },
              ]}
              onPress={() => onFilterChange(filter.key)}>
              <Text
                style={[
                  styles.filterText,
                  {
                    fontFamily: FONTS.MEDIUM,
                    color: isSelected
                      ? COLORS.COMPONENTS.BUTTON.TEXT_COLOR
                      : COLORS.COMPONENTS.TEXT.SECONDARY_COLOR,
                  },
                ]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 14,
  },
});

export default ProtocolQuickFilters;
