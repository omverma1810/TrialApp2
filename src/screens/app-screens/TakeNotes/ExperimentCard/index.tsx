import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {DropdownArrow} from '../../../../assets/icons/svgs';
import BottomModal from '../../../../components/BottomSheetModal';
import Chip from '../../../../components/Chip';
import TakeNotesStyles from '../../TakeNotes/TakeNotesStyle';
import {styles} from './styles';
import {useTranslation} from 'react-i18next';
import {LOCALES} from '../../../../localization/constants';
import {formatExperimentTypeForDisplay} from '../../../../utilities/experimentTypeUtils';

const ExperimentCard = ({
  data,
  isFirstIndex,
  isLastIndex,
  onExperimentSelect,
  name,
  onFieldSelect,
  defaultChipTitle,
  selectedItem,
  isEdit,
  resetExperiment,
  onReset,
}: any) => {
  const {t, i18n} = useTranslation();
  const language = i18n.language;
  const bottomSheetModalRef = useRef<any>(null);
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
  const [selectedField, setSelectedField] = useState<any>(null);

  // Synchronize incoming selectedItem into internal state and update chip title
  useEffect(() => {
    if (selectedItem) {
      if (name === 'field') {
        setSelectedField(selectedItem);
        setChipTitle(selectedItem.location?.fieldLabel || getDefaultTitle());
      } else if (name === 'experiment') {
        setSelectedExperiment(selectedItem);
        setChipTitle(
          selectedItem.fieldExperimentName ||
            selectedItem.experimentName ||
            getDefaultTitle(),
        );
      }
    }
  }, [selectedItem, name, getDefaultTitle]);

  // Handle both experiment and field selection
  const handleExperimentSelect = (item: any) => {
    if (name === 'field' && !isEdit) {
      setSelectedField(item);
      setChipTitle(item.location?.fieldLabel || getDefaultTitle());
      onFieldSelect(item);
    } else {
      setSelectedExperiment(item);
      const title =
        item.fieldExperimentName || item.experimentName || getDefaultTitle();
      setChipTitle(title);
      onExperimentSelect(item);
    }
    bottomSheetModalRef.current?.dismiss();
  };

  // Present modal
  const handleChipPress = () => {
    if (isEdit) return; // disable opening in edit mode
    bottomSheetModalRef.current?.present();
  };

  // Reset state when requested
  useEffect(() => {
    if (resetExperiment) {
      setSelectedExperiment(null);
      setSelectedField(null);
      setChipTitle(getDefaultTitle());
      onReset();
    }
  }, [resetExperiment, onReset, name, getDefaultTitle]);

  useEffect(() => {
    if (!selectedExperiment && !selectedField) {
      setChipTitle(getDefaultTitle());
    }
  }, [language, selectedExperiment, selectedField, getDefaultTitle]);

  // Background color for experiment type badge
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

  return (
    <View
      style={[
        isFirstIndex && styles.firstIndex,
        isLastIndex && styles.lastIndex,
      ]}>
      {/* Initial placeholder chip */}
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

      {/* Selected Experiment Chip */}
      {selectedExperiment && name === 'experiment' && (
        <Pressable onPress={!isEdit ? handleChipPress : undefined}>
          <View style={TakeNotesStyles.chipItem}>
            <Text style={TakeNotesStyles.chipTitle}>
              {t(LOCALES.EXPERIMENT.LBL_EXPERIMENT)}
            </Text>
            <View style={TakeNotesStyles.chipTextRow}>
              <Text style={TakeNotesStyles.chipText}>
                {selectedExperiment.fieldExperimentName ||
                  selectedExperiment.experimentName}
              </Text>
              {!isEdit && <DropdownArrow />}
            </View>
            {!isEdit && (
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
            )}
          </View>
        </Pressable>
      )}

      {/* Selected Field Chip */}
      {selectedField && name === 'field' && (
        <Pressable onPress={!isEdit ? handleChipPress : undefined}>
          <View style={TakeNotesStyles.chipItem}>
            <Text style={TakeNotesStyles.chipTitle}>
              {t(LOCALES.EXPERIMENT.LBL_FIELD)}
            </Text>
            <View style={TakeNotesStyles.chipTextRow}>
              <Text style={TakeNotesStyles.chipText}>
                {selectedField.location?.fieldLabel}
              </Text>
              {!isEdit && <DropdownArrow />}
            </View>
          </View>
        </Pressable>
      )}

      {/* Modal for selection list */}
      <BottomModal
        bottomSheetModalRef={bottomSheetModalRef}
        type="CONTENT_HEIGHT"
        containerStyle={{paddingBottom: bottom}}
        // Do not show modal content in edit mode
      >
        <View style={TakeNotesStyles.modalContainer}>
          <Text style={TakeNotesStyles.modalTitle}>
            {name === 'field'
              ? t(LOCALES.EXPERIMENT.LBL_SELECT_FIELD)
              : t(LOCALES.EXPERIMENT.LBL_SELECT_EXPERIMENT)}
          </Text>
          <ScrollView style={{flexGrow: 1}}>
            <View style={{gap: 30}}>
              {!isEdit &&
                Array.isArray(data) &&
                data.map((item: any, index: number) => (
                  <TouchableOpacity
                    key={`${item.id}-${index}`}
                    onPress={() => handleExperimentSelect(item)}
                    style={TakeNotesStyles.modalItemContainer}>
                    <Text style={TakeNotesStyles.modalItemText}>
                      {name === 'field'
                        ? item.location?.fieldLabel
                        : item.fieldExperimentName || item.experimentName}
                    </Text>
                    {name === 'experiment' && (
                      <Text
                        style={[
                          TakeNotesStyles.modalItemCropText,
                          {
                            backgroundColor: getBackgroundColor(
                              item.experimentType,
                            ),
                          },
                        ]}>
                        {formatExperimentTypeForDisplay(item.experimentType)}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
            </View>
          </ScrollView>
        </View>
      </BottomModal>
    </View>
  );
};

export default ExperimentCard;
