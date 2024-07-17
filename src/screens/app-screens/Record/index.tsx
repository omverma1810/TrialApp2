import {Pressable, StyleSheet, FlatList} from 'react-native';
import {SafeAreaView, StatusBar} from '../../../components';
import React, {useState, useRef, useMemo} from 'react';
import {View, Text, ScrollView, TextInput} from 'react-native';

import BottomModal from '../../../components/BottomSheetModal';
import {DropdownArrow, Search} from '../../../assets/icons/svgs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {experiment} from '../../../Data';
import Chip from '../../../components/Chip';
import RecordDropDown from '../../../components/RecordDropdown';
import Filter from './Filter';
import CheckBox from '../../../components/CheckBox';
import TraitComponent from '../../../components/TraitComponent';
import RecordStyles from './RecordStyles';
import {projectData} from './Data';
import {BottomSheetModalMethods} from '@gorhom/bottom-sheet/lib/typescript/types';
import {LOCALES} from '../../../localization/constants';
import {useTranslation} from 'react-i18next';
import {crops, projects, experiments} from '../Experiment/data';

interface SelectedFieldData {
  fieldName: string;
  plots: any;
}
interface ProjectData {
  [key: string]: {
    plot: string;
    entries: {date: string; notes: string}[];
  }[];
}
interface Chip {
  id: number;
  ExperientName?: string;
  CropName: string;
}

const Record = () => {
  const {t} = useTranslation();
  const [selectedExperiment, setSelectedExperiment] = useState<Chip | null>(
    null,
  );
  const [inputVisible, setInputVisible] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModalMethods>(null);
  const secondBottomModalRef = useRef<BottomSheetModalMethods>(null);
  const {bottom} = useSafeAreaInsets();
  const [activeListButton, setActiveListButton] = useState('Plot');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFields, setSelectedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedFieldData, setSelectedFieldData] =
    useState<SelectedFieldData | null>(null);

  const handleEdit = () => {
    setModalVisible(true);
  };

  const handleListPress = (button: string) => {
    setActiveListButton(button);
  };

  const handleRightIconClick = () => {
    bottomSheetModalRef.current?.present();
  };

  const handleExperimentSelect = (item: Chip) => {
    setSelectedExperiment(item);
    setInputVisible(true);
    bottomSheetModalRef.current?.dismiss();
  };

  const handleSecondBottomModalOpen = () => {
    secondBottomModalRef.current?.present();
  };

  const handleFieldSelect = (field: string) => {
    const isSelected = !selectedFields[field];
    setSelectedFields(prevState => ({
      ...prevState,
      [field]: isSelected,
    }));
    if (isSelected) {
      setSelectedFieldData({
        fieldName: field,
        plots: projectData[field as keyof typeof projectData],
      });
    } else {
      setSelectedFieldData(null);
    }
  };
  const ListHeaderComponent = useMemo(
    () => (
      <View style={{gap: 15, paddingVertical: 10}}>
        <Filter
          title={t(LOCALES.EXPERIMENT.LBL_CROP)}
          options={crops}
          onPress={option => {}}
        />
        <Filter
          title={t(LOCALES.EXPERIMENT.LBL_PROJECT)}
          options={projects}
          onPress={option => {}}
        />
      </View>
    ),
    [],
  );

  return (
    <SafeAreaView>
      <StatusBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={RecordStyles.container}>
          <View style={RecordStyles.searchContainer}>
            <Search />
            <TextInput
              style={RecordStyles.searchInput}
              placeholderTextColor="#949494"
              placeholder="Search Experiments"
            />
          </View>
          <FlatList
            data={experiments}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={ListHeaderComponent}
            renderItem={({item}) => null}
          />
          <View style={RecordStyles.experimentContainer}>
            {selectedExperiment && (
              <View style={RecordStyles.experimentItem}>
                <Text style={RecordStyles.experimentTitle}>Experiment</Text>
                <View style={RecordStyles.experimentRow}>
                  <Text style={RecordStyles.experimentText}>
                    {selectedExperiment.ExperientName ||
                      'Experiment Name Not Available'}
                  </Text>
                  <DropdownArrow />
                </View>
                <View style={RecordStyles.experimentCrop}>
                  <Text style={RecordStyles.experimentCropText}>
                    {selectedExperiment.CropName}
                  </Text>
                </View>
              </View>
            )}
          </View>
          {!inputVisible && (
            <Chip
              onPress={handleRightIconClick}
              rightIcon={<DropdownArrow />}
              onRightIconClick={handleRightIconClick}
              containerStyle={RecordStyles.chip}
              customLabelStyle={RecordStyles.chipLabel}
              title="Select an Experiment"
              isSelected={false}
            />
          )}
          {inputVisible && (
            <View style={RecordStyles.inputContainer}>
              <Pressable onPress={handleSecondBottomModalOpen}>
                <View style={RecordStyles.fieldContainer}>
                  <View style={RecordStyles.fieldRow}>
                    <Text style={RecordStyles.fieldTitle}>All Fields</Text>
                    <Pressable onPress={handleSecondBottomModalOpen}>
                      <DropdownArrow />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
              {selectedFieldData && (
                <View style={RecordStyles.inputContainer}>
                  <View style={RecordStyles.listByContainer}>
                    <Text style={RecordStyles.listByText}>List By</Text>
                    <View style={RecordStyles.listByButtonsContainer}>
                      <Pressable
                        onPress={() => handleListPress('Plot')}
                        style={[
                          RecordStyles.listByButton,
                          activeListButton === 'Plot'
                            ? RecordStyles.activeListByButton
                            : RecordStyles.inactiveListByButton,
                        ]}>
                        <Text
                          style={{
                            fontSize: 15,
                            color:
                              activeListButton === 'Plot' ? 'white' : '#0E3C74',
                          }}>
                          Plots
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleListPress('Traits')}
                        style={[
                          RecordStyles.listByButton,
                          {
                            borderRadius: 8,
                            paddingHorizontal: 10,
                            width: '20%',
                          },
                          activeListButton === 'Traits'
                            ? RecordStyles.activeListByButton
                            : RecordStyles.inactiveListByButton,
                        ]}>
                        <Text
                          style={{
                            fontSize: 15,
                            color:
                              activeListButton === 'Traits'
                                ? 'white'
                                : '#0E3C74',
                          }}>
                          Traits
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                  {activeListButton === 'Plot' && (
                    <RecordDropDown
                      selectedFields={selectedFields}
                      projectData={projectData}
                    />
                  )}
                  {activeListButton === 'Traits' && (
                    <TraitComponent
                      titles={[
                        'Plant height after 20 days',
                        'Tiller',
                        'Flowering Date',
                        'Days to first Flower',
                        'Title 5',
                        'Title 6',
                        'Title 7',
                      ]}
                      selectedFieldsData={Object.keys(selectedFields)
                        .filter(field => selectedFields[field])
                        .map(field => ({
                          fieldName: field,
                          plots:
                            projectData[field as keyof typeof projectData] ||
                            [],
                        }))}
                    />
                  )}
                </View>
              )}
            </View>
          )}

          <BottomModal
            bottomSheetModalRef={bottomSheetModalRef}
            type="CONTENT_HEIGHT"
            containerStyle={{paddingBottom: bottom}}>
            <View style={RecordStyles.modalContainer}>
              <Text style={RecordStyles.modalTitle}>Select an Experiment</Text>
              <ScrollView>
                <View style={{gap: 30}}>
                  {experiment.map((item, index) => (
                    <Pressable
                      key={`${item.id}-${index}`}
                      onPress={() => handleExperimentSelect(item)}
                      style={RecordStyles.modalItem}>
                      <Text style={RecordStyles.modalItemText}>
                        {item.ExperientName}
                      </Text>
                      <Text
                        style={[
                          RecordStyles.modalItemCropText,
                          {
                            backgroundColor:
                              item.CropName === 'Rice' ? '#FCEBEA' : '#E8F0FB',
                          },
                        ]}>
                        {item.CropName}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          </BottomModal>

          <BottomModal
            bottomSheetModalRef={secondBottomModalRef}
            type="CONTENT_HEIGHT"
            containerStyle={{paddingBottom: bottom}}>
            <View style={RecordStyles.modalContainer}>
              <Text style={RecordStyles.modalTitle}>Select a Field</Text>
              <ScrollView>
                <View style={{gap: 30}}>
                  {Object.keys(projectData).map((field, index) => (
                    <View
                      key={index}
                      style={RecordStyles.fieldCheckboxContainer}>
                      <CheckBox
                        value={!!selectedFields[field]}
                        onChange={() => handleFieldSelect(field)}
                      />
                      <Text style={RecordStyles.fieldCheckboxText}>
                        {field}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </BottomModal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Record;

const styles = StyleSheet.create({});
