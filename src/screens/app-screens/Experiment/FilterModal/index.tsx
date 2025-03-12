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

type FilterDataType = {
  Years: {value: number | string; label: string}[];
  Crops: {value: number | string; label: string}[];
  Seasons: {value: string; label: string}[];
  Locations: {value: number | string; label: string}[];
};

type FilterModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onFilterSelect: (
    filterType: 'Seasons' | 'Locations' | 'Years' | 'Crops',
    selectedOptions: string[],
  ) => void;
  filterData: FilterDataType | null;
};

const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  onClose,
  onFilterSelect,
  filterData,
}) => {
  const {t} = useTranslation();

  // Provide a safe default in case filterData is null
  const safeFilterData: FilterDataType = filterData || {
    Years: [],
    Crops: [],
    Seasons: [],
    Locations: [],
  };

  const [selectedYear, setSelectedYear] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<
    'Locations' | 'Seasons' | 'Years' | 'Crops' | ''
  >('');

  const handleSelection = (
    filterType: 'Seasons' | 'Locations' | 'Years' | 'Crops',
    value: string,
  ) => {
    let updatedSelection: string[] = [];

    if (filterType === 'Seasons') {
      updatedSelection = selectedSeason.includes(value)
        ? selectedSeason.filter(season => season !== value)
        : [...selectedSeason, value];
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
    } else if (filterType === 'Crops') {
      updatedSelection = selectedCrop.includes(value)
        ? selectedCrop.filter(crop => crop !== value)
        : [...selectedCrop, value];
      setSelectedCrop(updatedSelection);
    }

    console.log('Selected Filters:', {
      Seasons: selectedSeason,
      Locations: selectedLocation,
      Years: selectedYear,
      Crops: selectedCrop,
    });

    onFilterSelect(filterType, updatedSelection);
  };

  const clearAllSelections = () => {
    setSelectedYear([]);
    setSelectedLocation([]);
    setSelectedSeason([]);
    setSelectedCrop([]);
    onFilterSelect('Seasons', []);
    onFilterSelect('Locations', []);
    onFilterSelect('Years', []);
    onFilterSelect('Crops', []);
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
          <View style={styles.sidebarContainer}>
            {Object.entries(safeFilterData).map(([filterKey]) => (
              <Pressable
                key={filterKey}
                style={[
                  styles.sidebarItem,
                  selectedFilter === filterKey && styles.sidebarItemActive,
                ]}
                onPress={() =>
                  setSelectedFilter(
                    filterKey as 'Seasons' | 'Locations' | 'Years' | 'Crops',
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

          <ScrollView>
            <View style={styles.rightPane}>
              {selectedFilter && safeFilterData[selectedFilter] && (
                <View style={{marginTop: 16}}>
                  {safeFilterData[selectedFilter].map(option => (
                    <Pressable
                      key={option.value.toString()}
                      onPress={() =>
                        handleSelection(
                          selectedFilter as
                            | 'Seasons'
                            | 'Locations'
                            | 'Years'
                            | 'Crops',
                          option.value.toString(),
                        )
                      }
                      style={styles.dropdownItem}>
                      <Tick
                        color={
                          (selectedFilter === 'Seasons' &&
                            selectedSeason.includes(option.value.toString())) ||
                          (selectedFilter === 'Locations' &&
                            selectedLocation.includes(
                              option.value.toString(),
                            )) ||
                          (selectedFilter === 'Crops' &&
                            selectedCrop.includes(option.value.toString())) ||
                          (selectedFilter === 'Years' &&
                            selectedYear.includes(option.value.toString()))
                            ? '#1A6DD2'
                            : '#D3D3D3'
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
  footerButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: FONTS.MEDIUM,
  },
});

export default FilterModal;
