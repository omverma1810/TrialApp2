import React, {Fragment, useState, useEffect, useCallback} from 'react';
import {Pressable, View, ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native'; // ✅ ADDED

import {
  Button,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
  Text,
} from '../../../components';
import {LOCALES} from '../../../localization/constants';
import {styles} from './styles';
import {Back, Adfilter} from '../../../assets/icons/svgs';
import SelectExperiment from './SelectExperiment';
import SelectField from './SelectField';
import SelectPlot from './SelectPlot';
import {NewRecordScreenProps} from '../../../types/navigation/appTypes';
import UnrecordedTraits from './UnrecordedTraits';
import NotesModal from './NotesModal';
import Notes from './Notes';
import TraitsImage from './TraitsImage';
import FilterModal from '../Experiment/FilterModal';
import {useRecord, RecordProvider} from './RecordContext';
import {RecordApiProvider, useRecordApi} from './RecordApiContext';

const NewRecord = ({navigation}: NewRecordScreenProps) => {
  const {t} = useTranslation();
  const {
    notes,
    images,
    userInteractionOptions,
    isNotesModalVisible,
    isUnrecordedTraitsVisible,
    isSaveRecordBtnVisible,
    isNotesVisible,
    isTraitsImageVisible,
    hasNextPlot,
    closeNotesModal,
    onSaveRecord,
    onSaveNotes,
    onDeleteImages,
  } = useRecord();

  // 1️⃣ control experiment dropdown open/closed
  const [isExperimentOpen, setExperimentOpen] = useState(true);
  const showDependentPickers = !isExperimentOpen;

  // 2️⃣ FilterModal state
  const {getFilters, filtersData, isFiltersLoading} = useRecordApi();
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    Seasons: string[];
    Locations: string[];
    Years: string[];
    crops: string[];
  }>({
    Seasons: [],
    Locations: [],
    Years: [],
    crops: [],
  });

  // fetch available filter options once
  useEffect(() => {
    getFilters();
  }, [getFilters]);

  // ✅ Auto-expand experiment picker when screen regains focus
  useFocusEffect(
    useCallback(() => {
      setExperimentOpen(true);
    }, []),
  );

  useEffect(() => {
    if (filtersData?.filters) {
      const {Crops, Years, Seasons} = filtersData.filters;

      // Set selectedFilters state
      setSelectedFilters({
        Seasons:
          Seasons && Array.isArray(Seasons) && Seasons.length
            ? [Seasons[0].label]
            : [],
        Locations: [],
        Years:
          Years && Array.isArray(Years) && Years.length ? [Years[0].label] : [],
        crops:
          Crops && Array.isArray(Crops) && Crops.length ? [Crops[0].label] : [],
      });
    }
  }, [filtersData]);

  const onFilterSelect = (
    filterType: 'Seasons' | 'Locations' | 'Years',
    values: string[],
  ) => {
    setSelectedFilters(prev => {
      const newFilters = {...prev, [filterType]: values};
      return newFilters;
    });
  };

  const onApplyFilters = () => {
    setFilterModalVisible(false);
    setExperimentOpen(true);
  };

  const onClearAllFilters = () => {
    setSelectedFilters({Seasons: [], Locations: [], Years: [], crops: []});
    setFilterModalVisible(false);
    setExperimentOpen(true);
  };


  return (
    <SafeAreaView edges={['top']}>
      <KeyboardAvoidingView>
        <StatusBar />

        {/* Header */}
        <View style={[styles.header, styles.row]}>
          <Pressable onPress={navigation.goBack}>
            <Back />
          </Pressable>
          <Text style={styles.headerTitle}>
            {t(LOCALES.EXPERIMENT.NEW_RECORD)}
          </Text>
          <Pressable
            style={{marginLeft: 'auto'}}
            onPress={() => setFilterModalVisible(true)}>
            <Adfilter />
          </Pressable>
        </View>

        {/* Main body */}
        <ScrollView
          contentContainerStyle={{flexGrow: 1, paddingBottom: 60}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {/* 1️⃣ Experiment Picker */}
            <SelectExperiment
              isOpen={isExperimentOpen}
              setIsOpen={setExperimentOpen}
              filters={selectedFilters}
              onFiltersChange={setSelectedFilters}
            />

            {/* 2️⃣ Everything else only when experiment picker is closed */}
            {showDependentPickers && (
              <>
                {/* <SelectField />
                <SelectPlot /> */}

                {isUnrecordedTraitsVisible && (
                  <Fragment>
                    <View style={styles.userInteractionContainer}>
                      {userInteractionOptions.map(opt => (
                        <Pressable
                          key={opt.id}
                          style={styles.optionContainer}
                          onPress={opt.onPress}>
                          {opt.icon}
                          <Text style={styles.option}>{opt.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                    {isNotesVisible && <Notes notes={notes} />}
                    {isTraitsImageVisible && (
                      <TraitsImage
                        images={images}
                        metadata={{}}
                        onDeleteImages={onDeleteImages}
                      />
                    )}
                    <UnrecordedTraits />
                  </Fragment>
                )}
              </>
            )}
          </View>
        </ScrollView>

        {/* 3️⃣ Save buttons only when picker closed & traits visible */}
        {showDependentPickers && isUnrecordedTraitsVisible && (
          <View style={styles.saveRecordBtnContainer}>
            <Button
              title={t(LOCALES.EXPERIMENT.LBL_SAVE)}
              onPress={() => onSaveRecord(false)}
              loading={!hasNextPlot && isFiltersLoading}
              disabled={!isSaveRecordBtnVisible}
              containerStyle={{width: '45%'}}
            />
            <Button
              title={t(LOCALES.EXPERIMENT.LBL_SAVE_NEXT)}
              onPress={() => onSaveRecord(true)}
              loading={hasNextPlot && isFiltersLoading}
              disabled={!isSaveRecordBtnVisible}
              containerStyle={{width: '45%'}}
            />
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Notes Modal */}
      <NotesModal
        preNotes={notes}
        isModalVisible={isNotesModalVisible}
        closeModal={closeNotesModal}
        onDiscard={closeNotesModal}
        onSave={onSaveNotes}
      />

      {/* Global Filter Modal */}
      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={onApplyFilters}
        onClearAll={onClearAllFilters}
        onFilterSelect={onFilterSelect}
        filterData={isFiltersLoading ? null : filtersData?.filters}
        selectedFilters={{
          ...selectedFilters,
          Years: selectedFilters.Years.map(String),
          Crops: [], // empty array since no crops available
        }}
      />
    </SafeAreaView>
  );
};

export default (props: NewRecordScreenProps) => (
  <RecordApiProvider>
    <RecordProvider>
      <NewRecord {...props} />
    </RecordProvider>
  </RecordApiProvider>
);
