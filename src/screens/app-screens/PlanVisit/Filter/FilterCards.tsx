import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View, Pressable, Text, ScrollView, StyleSheet} from 'react-native';
import BottomSheetModalView from '../../../../components/BottomSheetModal';
import {DropdownArrow} from '../../../../assets/icons/svgs';
import styles from './FilterCards.styles';
import Toast from '../../../../utilities/toast';
import {FONTS} from '../../../../theme/fonts';
import {useTranslation} from 'react-i18next';
import {LOCALES} from '../../../../localization/constants';

type YearOption = {value: number; label: number};
type SeasonOption = {value: string; label: string};
type CropOption = {value: number; label: string};

type FilterCardsProps = {
  yearOptions: YearOption[];
  seasonOptions: SeasonOption[];
  cropOptions: CropOption[];
  selectedYears: string[];
  selectedSeasons: string[];
  selectedCrops: string[];
  onSelectYear: (yearLabels: string[]) => void;
  onSelectSeason: (seasonLabels: string[]) => void;
  onSelectCrop: (cropLabels: string[]) => void;
  isDisabled?: boolean;
  disabledMessage?: string;
};

const FilterCards: React.FC<FilterCardsProps> = ({
  yearOptions,
  seasonOptions,
  cropOptions,
  selectedYears,
  selectedSeasons,
  selectedCrops,
  onSelectYear,
  onSelectSeason,
  onSelectCrop,
  isDisabled = false,
  disabledMessage,
}) => {
  const {t} = useTranslation();
  const yearSheetRef = useRef<any>(null);
  const seasonSheetRef = useRef<any>(null);
  const cropSheetRef = useRef<any>(null);

  // Local state for multi-select
  const [tempYears, setTempYears] = useState<string[]>(selectedYears);
  const [tempSeasons, setTempSeasons] = useState<string[]>(selectedSeasons);
  const [tempCrops, setTempCrops] = useState<string[]>(selectedCrops);

  // Helper function to normalize years to strings
  const normalizeYearsToStrings = (years: string[]) => {
    return years.map(year => year.toString());
  };

  // Sync temporary state with props when they change
  useEffect(() => {
    setTempYears(selectedYears ? normalizeYearsToStrings(selectedYears) : []);
  }, [selectedYears]);

  useEffect(() => {
    setTempSeasons(selectedSeasons ? [...selectedSeasons] : []);
  }, [selectedSeasons]);

  useEffect(() => {
    setTempCrops(selectedCrops ? [...selectedCrops] : []);
  }, [selectedCrops]);

  // Sync local state with props when sheet opens
  const openYearModal = () => {
    if (isDisabled) {
      Toast.info({message: localizedDisabledMessage});
      return;
    }
    setTempYears(selectedYears ? normalizeYearsToStrings(selectedYears) : []); // Create a new array to avoid reference issues
    yearSheetRef.current?.present();
  };
  const openSeasonModal = () => {
    if (isDisabled) {
      Toast.info({message: localizedDisabledMessage});
      return;
    }
    setTempSeasons(selectedSeasons ? [...selectedSeasons] : []); // Create a new array to avoid reference issues
    seasonSheetRef.current?.present();
  };
  const openCropModal = () => {
    if (isDisabled) {
      Toast.info({message: localizedDisabledMessage});
      return;
    }
    setTempCrops(selectedCrops ? [...selectedCrops] : []); // Create a new array to avoid reference issues
    cropSheetRef.current?.present();
  };

  // Helper function to get display text for multi-select
  const getDisplayText = (
    selectedItems: string[],
    defaultText: string,
    filterType: string,
  ) => {
    if (
      !selectedItems ||
      !Array.isArray(selectedItems) ||
      selectedItems.length === 0
    ) {
      return defaultText;
    } else if (selectedItems.length === 1) {
      return selectedItems[0];
    } else {
      return `${selectedItems.length} ${filterType}`;
    }
  };

  const localizedDisabledMessage = useMemo(
    () => disabledMessage || t(LOCALES.TAKE_NOTES.MSG_EDITING_RESTRICTED),
    [disabledMessage, t],
  );

  return (
    <View style={styles.row}>
      {/* Year Card */}
      <View style={styles.cardContainer}>
        <Pressable style={styles.card} onPress={openYearModal}>
          <Text style={styles.cardText}>
            {getDisplayText(
              selectedYears,
              t(LOCALES.FILTER.LBL_YEAR),
              t(LOCALES.FILTER.LBL_YEARS),
            )}
          </Text>
          <DropdownArrow />
        </Pressable>
        <BottomSheetModalView
          bottomSheetModalRef={yearSheetRef}
          type="CONTENT_HEIGHT">
          <View style={{flex: 1, minHeight: 300}}>
            <ScrollView
              style={styles.sheetContent}
              contentContainerStyle={{paddingBottom: 80}}>
              {(yearOptions || []).map(opt => {
                const label = opt.label.toString();
                // Check if the label exists in tempYears (as string) or if the number version exists as string
                const isActive =
                  tempYears?.includes(label) ||
                  tempYears?.includes(opt.label.toString()) ||
                  false;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      // For years, only allow single selection
                      setTempYears(prev =>
                        prev.includes(label) ? [] : [label],
                      );
                    }}
                    style={[styles.option, isActive && styles.optionActive]}>
                    <Text
                      style={[
                        styles.optionText,
                        isActive && styles.optionTextActive,
                      ]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={fixedButtonStyles.bottomBar}>
              <Pressable
                style={styles.applyButton}
                onPress={() => {
                  // Remove duplicates and ensure all are strings
                  const normalizedSelection = tempYears
                    ? normalizeYearsToStrings(tempYears)
                    : [];
                  const uniqueSelection = [...new Set(normalizedSelection)];
                  onSelectYear(uniqueSelection);
                  yearSheetRef.current?.dismiss();
                }}>
                <Text style={styles.applyButtonText}>
                  {t(LOCALES.FILTER.BTN_APPLY)}
                </Text>
              </Pressable>
            </View>
          </View>
        </BottomSheetModalView>
      </View>

      {/* Season Card */}
      <View style={styles.cardContainer}>
        <Pressable style={styles.card} onPress={openSeasonModal}>
          <Text style={styles.cardText}>
            {getDisplayText(
              selectedSeasons,
              t(LOCALES.FILTER.LBL_SEASON),
              t(LOCALES.FILTER.LBL_SEASONS),
            )}
          </Text>
          <DropdownArrow />
        </Pressable>
        <BottomSheetModalView
          bottomSheetModalRef={seasonSheetRef}
          type="CONTENT_HEIGHT">
          <View style={{flex: 1, minHeight: 300}}>
            <ScrollView
              style={styles.sheetContent}
              contentContainerStyle={{paddingBottom: 80}}>
              {(seasonOptions || []).map(opt => {
                const label = opt.label;
                const isActive = tempSeasons?.includes(label) || false;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      // For seasons, only allow single selection
                      setTempSeasons(prev =>
                        prev.includes(label) ? [] : [label],
                      );
                    }}
                    style={[styles.option, isActive && styles.optionActive]}>
                    <Text
                      style={[
                        styles.optionText,
                        isActive && styles.optionTextActive,
                      ]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={fixedButtonStyles.bottomBar}>
              <Pressable
                style={styles.applyButton}
                onPress={() => {
                  onSelectSeason(tempSeasons || []);
                  seasonSheetRef.current?.dismiss();
                }}>
                <Text style={styles.applyButtonText}>
                  {t(LOCALES.FILTER.BTN_APPLY)}
                </Text>
              </Pressable>
            </View>
          </View>
        </BottomSheetModalView>
      </View>

      {/* Crop Card */}
      <View style={styles.cardContainer}>
        <Pressable style={styles.card} onPress={openCropModal}>
          <Text style={styles.cardText}>
            {getDisplayText(
              selectedCrops,
              t(LOCALES.FILTER.LBL_CROP),
              t(LOCALES.FILTER.LBL_CROPS),
            )}
          </Text>
          <DropdownArrow />
        </Pressable>
        <BottomSheetModalView
          bottomSheetModalRef={cropSheetRef}
          type="CONTENT_HEIGHT">
          <View style={{flex: 1, minHeight: 300}}>
            <ScrollView
              style={styles.sheetContent}
              contentContainerStyle={{paddingBottom: 80}}>
              {(cropOptions || []).map(opt => {
                const label = opt.label;
                const isActive = tempCrops?.includes(label) || false;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      // Single-select toggle: if the crop is already selected, clear it; otherwise replace with only this crop
                      setTempCrops(prev =>
                        prev.includes(label) ? [] : [label],
                      );
                    }}
                    style={[styles.option, isActive && styles.optionActive]}>
                    <Text
                      style={[
                        styles.optionText,
                        isActive && styles.optionTextActive,
                      ]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={fixedButtonStyles.bottomBar}>
              <Pressable
                style={styles.applyButton}
                onPress={() => {
                  onSelectCrop(tempCrops || []);
                  cropSheetRef.current?.dismiss();
                }}>
                <Text style={styles.applyButtonText}>
                  {t(LOCALES.FILTER.BTN_APPLY)}
                </Text>
              </Pressable>
            </View>
          </View>
        </BottomSheetModalView>
      </View>
    </View>
  );
};

export default React.memo(FilterCards);

// Add styles for the fixed bottom bar
const fixedButtonStyles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
