import React, {useState} from 'react';
import {
  Modal,
  StyleSheet,
  Pressable,
  View,
  ScrollView,
  Text,
  SafeAreaView,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Tick} from '../../../../assets/icons/svgs';
import {FONTS} from '../../../../theme/fonts';

const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  onClose,
  onFilterSelect,
  filterData,
}) => {
  const {t} = useTranslation();

  // States to manage selected filters
  const [selectedYear, setSelectedYear] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string[]>();
  const [selectedSeason, setSelectedSeason] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<
    'Locations' | 'Seasons' | 'Years' | ''
  >('');

  // Function to handle selection updates
  const handleSelection = (
    filterType: 'Seasons' | 'Locations' | 'Years',
    value: string,
  ) => {
    let updatedSelection: string[];

    if (filterType === 'Seasons') {
      updatedSelection = selectedSeason.includes(value)
        ? selectedSeason.filter(season => season !== value) // Remove
        : [...selectedSeason, value]; // Add
      setSelectedSeason(updatedSelection);
    } else if (filterType === 'Locations') {
      updatedSelection = selectedLocation.includes(value)
        ? selectedLocation.filter(location => location !== value)
        : [...selectedLocation, value];
      setSelectedLocation(updatedSelection);
    } else if (filterType === 'Years') {
      updatedSelection = selectedYear.includes(value)
        ? selectedYear.filter(year => year !== value)
        : [...selectedYear, value];
      setSelectedYear(updatedSelection);
    }

    // Send updated selection array instead of just `value`
    onFilterSelect(filterType, updatedSelection);
  };

  console.log('years',selectedYear)

  const clearAllSelections = () => {
    setSelectedYear([]);
    setSelectedLocation([]);
    setSelectedSeason([]);
    onFilterSelect('Seasons', []);
    onFilterSelect('Locations', []);
    onFilterSelect('Years', []);
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}>
      <SafeAreaView style={styles.filterModalContainer}>
        <View style={styles.filterModalHeader}>
          <Text style={styles.filterModalTitle}>
            {t('Filters') || 'Filters'}
          </Text>
          <Pressable onPress={clearAllSelections}>
            <Text style={styles.filterModalCloseText}>
              {t('CLEAR ALL') || 'CLEAR ALL'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.twoColumnContainer}>
          {/* Sidebar */}
          <View style={styles.sidebarContainer}>
            {filterData &&
              Object.entries(filterData).map(([filterKey, filterValues]) => (
                <Pressable
                  key={filterKey}
                  style={[
                    styles.sidebarItem,
                    selectedFilter === filterKey && styles.sidebarItemActive,
                  ]}
                  onPress={() =>
                    setSelectedFilter(
                      filterKey as 'Seasons' | 'Locations' | 'Years',
                    )
                  }>
                  <Text
                    style={[
                      styles.sidebarItemText,
                      selectedFilter === filterKey &&
                        styles.sidebarItemTextActive,
                    ]}>
                    {t(filterKey) ||
                      filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
                  </Text>
                </Pressable>
              ))}
          </View>

          {/* Right Pane */}
          <ScrollView>
            <View style={styles.rightPane}>
              {selectedFilter && filterData[selectedFilter] && (
                <View style={{marginTop: 16}}>
                  {filterData[selectedFilter].map(option => (
                    <Pressable
                      key={option.value}
                      onPress={() =>
                        handleSelection(selectedFilter, option.value)
                      }
                      style={styles.dropdownItem}>
                      <Tick
                        color={
                          (selectedFilter === 'Seasons' &&
                            selectedSeason.includes(option.value)) ||
                          (selectedFilter === 'Locations' &&
                            selectedLocation.includes(option.value)) ||
                          (selectedFilter === 'Years' &&
                            selectedYear.includes(option.value))
                            ? '#E32636'
                            : 'black'
                        }
                      />
                      <Text style={styles.dropdownItemText}>
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable onPress={onClose} style={styles.footerButton}>
            <Text style={styles.footerButtonText}>Close</Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.footerButton}>
            <Text style={styles.footerButtonText}>Apply</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Styles
const styles = StyleSheet.create({
  filterModalContainer: {flex: 1, backgroundColor: '#fff'},
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  filterModalTitle: {fontSize: 14, fontFamily: FONTS.SEMI_BOLD},
  filterModalCloseText: {
    fontSize: 14,
    fontFamily: FONTS.SEMI_BOLD,
    color: '#007AFF',
  },
  twoColumnContainer: {flex: 1, flexDirection: 'row'},
  sidebarContainer: {width: '35%', backgroundColor: '#F5F5F6'},
  sidebarItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 0.3,
    borderBottomColor: '#999',
  },
  sidebarItemActive: {backgroundColor: '#fff'},
  sidebarItemText: {fontSize: 14, fontFamily: FONTS.MEDIUM},
  sidebarItemTextActive: {fontFamily: FONTS.SEMI_BOLD},
  rightPane: {flex: 1, paddingHorizontal: 16},
  dropdownItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 0.3,
    borderBottomColor: '#999',
    flexDirection: 'row',
    gap: 10,
  },
  dropdownItemText: {fontFamily: FONTS.MEDIUM},
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 0.3,
    borderTopColor: '#e5e5e5',
  },
  footerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: '#1A6DD2',
  },
  footerButtonText: {fontSize: 14, color: '#fff', fontFamily: FONTS.MEDIUM},
});

export default FilterModal;
