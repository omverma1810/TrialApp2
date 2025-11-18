import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import BottomModal from '../../../../components/BottomSheetModal';
import TakeNotesStyles from '../../TakeNotes/TakeNotesStyle';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {styles} from './styles';
import {DropdownArrow} from '../../../../assets/icons/svgs';
import Chip from '../../../../components/Chip';
import SelectExperiment from '../../NewRecord/SelectExperiment';
import SelectField from '../../NewRecord/SelectField';
import {useTranslation} from 'react-i18next';
import {LOCALES} from '../../../../localization/constants';
import {formatExperimentTypeForDisplay} from '../../../../utilities/experimentTypeUtils';

interface Chip {
  id: number;
  ExperientName: string;
  CropName: string;
  fieldName?: string;
  Location?: string;
  Fieldno?: string;
}

const ExperimentCard = ({
  data,
  isFirstIndex,
  isLastIndex,
  onExperimentSelect,
  name,
  onFieldSelect,
  isProjectSelected,
  resetExperiment,
  onReset,
  onEndReached,
  loadingMore = false,
  hasMore = true,
}: any) => {
  const {t, i18n} = useTranslation();
  const language = i18n.language;
  const bottomSheetModalRef = useRef(null);
  const {bottom} = useSafeAreaInsets();
  const [selectedExperiment, setSelectedExperiment] = useState<any>(null);
  const getDefaultTitle = useCallback(() => {
    if (name === 'field') {
      return t(LOCALES.EXPERIMENT.LBL_SELECT_FIELD);
    }
    return t(LOCALES.EXPERIMENT.LBL_SELECT_EXPERIMENT);
  }, [name, t]);

  const [chipTitle, setChipTitle] = useState(getDefaultTitle);
  const [chipVisible, setChipVisible] = useState(true);
  const secondBottomSheetRef = useRef(null);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [hasCalledEnd, setHasCalledEnd] = useState(false);

  const handleExperimentSelect = (item: any) => {
    if (name === 'field') {
      setSelectedField(item);
      setChipTitle(item.location.villageName);
      onFieldSelect(item);
    } else {
      setSelectedExperiment(item);
      setChipTitle(item.fieldExperimentName);
      onExperimentSelect(item);
    }
    (bottomSheetModalRef.current as any).dismiss();
  };

  const handleFirstRightIconClick = () => {
    if (bottomSheetModalRef.current) {
      (bottomSheetModalRef.current as any).present();
    }
  };

  const handleChipPress = () => {
    handleFirstRightIconClick();
  };

  useEffect(() => {});
  const getBackgroundColor = (experimentType: any) => {
    switch (experimentType) {
      case 'hybrid':
        return '#fdf8ee';
      case 'line':
        return '#fcebea';
      default:
        return '#eaf4e7';
    }
  };
  useEffect(() => {
    if (resetExperiment) {
      setChipTitle(getDefaultTitle()); // Reset chip title
      onReset(); // Reset the flag in the parent component
      setSelectedExperiment(null); // Reset selected experiment
    }
  }, [resetExperiment, getDefaultTitle]);

  useEffect(() => {
    if (!selectedExperiment && !selectedField) {
      setChipTitle(getDefaultTitle());
    }
  }, [language, selectedExperiment, selectedField, getDefaultTitle]);

  return (
    <View
      style={[
        styles.container,
        isFirstIndex && styles.firstIndex,
        isLastIndex && styles.lastIndex,
      ]}>
      {!selectedExperiment && chipVisible && !selectedField && (
        <Chip
          onPress={handleChipPress}
          rightIcon={
            <TouchableOpacity onPress={handleChipPress}>
              <DropdownArrow />
            </TouchableOpacity>
          }
          containerStyle={TakeNotesStyles.chip}
          customLabelStyle={TakeNotesStyles.chipLabel}
          title={chipTitle}
          isSelected={false}
        />
      )}
      {selectedExperiment && (
        <Pressable onPress={handleChipPress}>
          <View style={TakeNotesStyles.chipItem}>
            <Text style={TakeNotesStyles.chipTitle}>
              {t(LOCALES.EXPERIMENT.LBL_EXPERIMENT)}
            </Text>
            <View style={TakeNotesStyles.chipTextRow}>
              <Text style={TakeNotesStyles.chipText}>
                {name == 'field'
                  ? selectedExperiment.location.villageName
                  : selectedExperiment.fieldExperimentName}
              </Text>
              <DropdownArrow />
            </View>
            <View
              style={[
                TakeNotesStyles.chipCropText,
                {
                  backgroundColor: getBackgroundColor(
                    selectedExperiment.experimentType,
                  ),
                },
              ]}>
              <Text style={TakeNotesStyles.chipCropText1}>
                {formatExperimentTypeForDisplay(
                  selectedExperiment.experimentType,
                )}
              </Text>
            </View>
          </View>
        </Pressable>
      )}
      {selectedField && (
        <Pressable onPress={handleChipPress}>
          <View style={TakeNotesStyles.chipItem}>
            <Text style={TakeNotesStyles.chipTitle}>
              {t(LOCALES.EXPERIMENT.LBL_FIELD)}
            </Text>
            <View style={TakeNotesStyles.chipTextRow}>
              <Text style={TakeNotesStyles.chipText}>
                {selectedField.location.fieldLabel}
              </Text>

              <DropdownArrow />
            </View>
            {/* <View style={TakeNotesStyles.chipCropText}>
            <Text style={TakeNotesStyles.chipCropText1}>
              {selectedExperiment.cropName}
            </Text>
          </View> */}
          </View>
        </Pressable>
      )}
      <BottomModal
        bottomSheetModalRef={bottomSheetModalRef}
        type="SCREEN_HEIGHT"
        containerStyle={{paddingBottom: bottom}}>
        <View style={TakeNotesStyles.modalContainer}>
          <Text style={TakeNotesStyles.modalTitle}>
            {t(LOCALES.EXPERIMENT.LBL_SELECT_EXPERIMENT_OR_FIELD)}
          </Text>
          <ScrollView
            onScroll={({nativeEvent}) => {
              const {layoutMeasurement, contentOffset, contentSize} =
                nativeEvent;
              const isBottom =
                layoutMeasurement.height + contentOffset.y >=
                contentSize.height - 20;
              if (isBottom && !hasCalledEnd && hasMore && !loadingMore) {
                setHasCalledEnd(true);
                onEndReached && onEndReached();
              } else if (!isBottom) {
                setHasCalledEnd(false);
              }
            }}
            scrollEventThrottle={16}>
            <View style={{gap: 30}}>
              {Array.isArray(data) &&
                data.map((item: any, index: number) => (
                  <TouchableOpacity
                    key={`${item.id}-${index}`}
                    onPress={() => handleExperimentSelect(item)}
                    style={TakeNotesStyles.modalItemContainer}>
                    <Text style={TakeNotesStyles.modalItemText}>
                      {name === 'field'
                        ? item.location.fieldLabel
                        : item.fieldExperimentName}
                    </Text>

                    {name == 'experiment' ? (
                      <Text
                        style={[
                          TakeNotesStyles.modalItemCropText,
                          {
                            backgroundColor:
                              item.experimentType === 'hybrid'
                                ? '#fdf8ee'
                                : item.experimentType === 'line'
                                ? '#fcebea'
                                : '#eaf4e7',
                          },
                        ]}>
                        {formatExperimentTypeForDisplay(item.experimentType)}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              {loadingMore && (
                <View style={{padding: 16, alignItems: 'center'}}>
                  <Text>{t(LOCALES.COMMON.LBL_LOADING_MORE)}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </BottomModal>
    </View>
  );
};

export default ExperimentCard;
