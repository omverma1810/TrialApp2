import React, {useRef, useState, useEffect} from 'react';
import {View, Pressable, Text, ScrollView, StyleSheet} from 'react-native';
import BottomSheetModalView from '../../../../components/BottomSheetModal';
import {DropdownArrow} from '../../../../assets/icons/svgs';
import styles from './FilterCards.styles';
import {FONTS} from '../../../../theme/fonts';
import {useTranslation} from 'react-i18next';
import {LOCALES} from '../../../../localization/constants';

type YearOption = {value: number; label: string};
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
}) => {
  const {t} = useTranslation();
  const yearSheetRef = useRef<any>(null);
  const seasonSheetRef = useRef<any>(null);
  const cropSheetRef = useRef<any>(null);

  // Local state for multi-select
  const [tempYears, setTempYears] = useState<string[]>(selectedYears);
  const [tempSeasons, setTempSeasons] = useState<string[]>(selectedSeasons);
  const [tempCrops, setTempCrops] = useState<string[]>(selectedCrops);

  // Sync temporary state with props when they change
  useEffect(() => {
    setTempYears(selectedYears ? [...selectedYears] : []);
  }, [selectedYears]);

  useEffect(() => {
    setTempSeasons(selectedSeasons ? [...selectedSeasons] : []);
  }, [selectedSeasons]);

  useEffect(() => {
    setTempCrops(selectedCrops ? [...selectedCrops] : []);
  }, [selectedCrops]);

  // Sync local state with props when sheet opens
  const openYearModal = () => {
    setTempYears(selectedYears ? [...selectedYears] : []);
    yearSheetRef.current?.present();
  };
  const openSeasonModal = () => {
    setTempSeasons(selectedSeasons ? [...selectedSeasons] : []);
    seasonSheetRef.current?.present();
  };
  const openCropModal = () => {
    setTempCrops(selectedCrops ? [...selectedCrops] : []);
    cropSheetRef.current?.present();
  };

  // Helper function to get display text for multi-select
  const getDisplayText = (
    selectedItems: string[],
    defaultText: string,
    pluralText: string,
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
      return `${selectedItems.length} ${pluralText}`;
    }
  };

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
                const label = opt.label;
                const isActive = tempYears?.includes(label) || false;
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
                  onSelectYear(tempYears);
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
                  onSelectSeason(tempSeasons);
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
                      // For crops, only allow single selection
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
                  onSelectCrop(tempCrops);
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
