import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  ScrollView,
  Platform,
  TextInput,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import Text from '../Text';
import Button from '../Button';
import {FONTS} from '../../theme/fonts';
import {CardArrowDown, CardArrowUp} from '../../assets/icons/svgs';
import useTheme from '../../theme/hooks/useTheme';
import {IndividualPlantsManagerProps, PlantData} from './types';

const IndividualPlantsManager: React.FC<IndividualPlantsManagerProps> = ({
  totalPlants = 4, // Initial default, but can be increased dynamically
  plantsData = [],
  visible = true,
  containerStyle,
  theme,
  onSave = () => {},
  onAverageChange,
  isSaving = false,
  isLoading = false,
  onExpand,
  onCollapse,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animatedHeight] = useState(new Animated.Value(0));
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [plantCount, setPlantCount] = useState<number>(totalPlants); // Track dynamic plant count
  const [isDataReady, setIsDataReady] = useState(false); // Track when data is ready to display
  const {COLORS} = useTheme();

  // Refs for input navigation - stores TextInput refs for each plant's inputs
  const inputRefs = useRef<{[key: string]: TextInput | null}>({});
  const scrollViewRef = useRef<ScrollView>(null);

  // Calculate average of plant values in real-time
  const calculateAverage = useCallback(() => {
    const validValues = plants
      .map(plant => parseFloat(plant.value))
      .filter(val => !isNaN(val) && val !== null && val !== undefined);

    if (validValues.length === 0) return null;

    const sum = validValues.reduce((acc, val) => acc + val, 0);
    const average = sum / validValues.length;

    return average;
  }, [plants]);

  // Handle sequential input navigation with automatic scrolling
  const handleInputSubmit = useCallback(
    (plantIndex: number, field: 'name' | 'value' | 'x' | 'y') => {
      let nextKey: string | null = null;

      // Determine next input field
      if (field === 'name') {
        nextKey = `plant_${plantIndex}_value`;
      } else if (field === 'value') {
        nextKey = `plant_${plantIndex}_x`;
      } else if (field === 'x') {
        nextKey = `plant_${plantIndex}_y`;
      } else if (field === 'y' && plantIndex < plantCount - 1) {
        // Move to next plant's name field
        nextKey = `plant_${plantIndex + 1}_name`;
      }

      // Focus next input if it exists
      if (nextKey && inputRefs.current[nextKey]) {
        inputRefs.current[nextKey]?.focus();

        // Scroll to the plant being edited (approximate position)
        if (field === 'y' && plantIndex < plantCount - 1) {
          setTimeout(() => {
            const nextPlantY = (plantIndex + 1) * 160; // Approximate height per plant card
            scrollViewRef.current?.scrollTo({
              y: nextPlantY,
              animated: true,
            });
          }, 100);
        }
      } else if (field === 'y' && plantIndex === plantCount - 1) {
        // Last input, dismiss keyboard
        Keyboard.dismiss();
      }
    },
    [plantCount],
  );

  // Update plants data whenever plantsData prop changes (from API or parent)
  useEffect(() => {
    // Case 1: Data provided from API (array with data)
    if (plantsData && plantsData.length > 0) {
      setPlants(plantsData);
      setPlantCount(plantsData.length);
      setIsDataReady(true);
      return;
    }

    // Case 2: API returned no data (empty array) - initialize with empty plants
    if (plantsData !== null && plantsData.length === 0) {
      const initialPlants: PlantData[] = [];
      for (let i = 1; i <= totalPlants; i++) {
        initialPlants.push({
          id: `plant_${i}`,
          name: '',
          value: '',
          x: '',
          y: '',
        });
      }
      setPlants(initialPlants);
      setPlantCount(totalPlants);
      setIsDataReady(true);
      return;
    }

    // Case 3: plantsData is null (not loaded yet or loading) - keep loading state
    if (plantsData === null) {
      setIsDataReady(false);
    }
  }, [plantsData, totalPlants]);

  // Notify parent of average changes in real-time
  useEffect(() => {
    if (onAverageChange) {
      const average = calculateAverage();
      onAverageChange(average);
    }
  }, [plants, calculateAverage, onAverageChange]);

  // Don't render if not visible
  if (!visible) {
    return null;
  }

  // Get theme colors based on the theme prop or system theme
  const isDarkTheme =
    theme === 'dark' || COLORS.APP.BACKGROUND_COLOR === '#000000';

  // Use app's brand colors for consistent theming
  const containerBgColor = isDarkTheme ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDarkTheme ? '#FFFFFF' : '#1C1C1E';
  const subTextColor = isDarkTheme ? '#AEAEB2' : '#6B7280';
  const borderColor = isDarkTheme ? '#3A3A3C' : '#E5E5EA';
  const dropdownBgColor = isDarkTheme ? '#2C2C2E' : '#F9FAFB';
  const inputBgColor = isDarkTheme ? '#252527' : '#F7F7F7';
  const accentColor = isDarkTheme ? '#BB85BB' : '#1A6DD2'; // Purple for dark, Blue for light
  const headerBgColor = isDarkTheme ? '#2C2C2E' : '#EFF6FF'; // Light blue tint for header
  const iconColor = isDarkTheme ? accentColor : '#3B82F6'; // Slightly brighter blue

  const toggleDropdown = () => {
    const toValue = isExpanded ? 0 : 1;

    Animated.timing(animatedHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();

    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    // Call accordion callbacks
    if (newExpandedState) {
      onExpand?.();
    } else {
      onCollapse?.();
    }
  };

  const updatePlantData = (
    plantId: string,
    field: keyof PlantData,
    value: string,
  ) => {
    setPlants(prevPlants =>
      prevPlants.map(plant =>
        plant.id === plantId ? {...plant, [field]: value} : plant,
      ),
    );
  };

  // Add new plant function
  const handleAddPlant = () => {
    const newPlantCount = plantCount + 1;
    setPlantCount(newPlantCount);

    // Add new plant to the list
    const newPlant: PlantData = {
      id: `plant_${newPlantCount}`,
      name: '',
      value: '',
      x: '',
      y: '',
    };

    setPlants(prevPlants => [...prevPlants, newPlant]);

    // Scroll to the newly added plant after a short delay
    setTimeout(() => {
      const newPlantY = (newPlantCount - 1) * 160;
      scrollViewRef.current?.scrollTo({
        y: newPlantY,
        animated: true,
      });
    }, 300);
  };

  // Remove plant function
  const handleRemovePlant = (plantId: string) => {
    if (plantCount <= 1) {
      return;
    }

    // Filter out the removed plant and reassign sequential IDs to maintain consistency
    setPlants(prevPlants => {
      const filteredPlants = prevPlants.filter(plant => plant.id !== plantId);

      // Reassign IDs sequentially (plant_1, plant_2, plant_3, etc.)
      const reindexedPlants = filteredPlants.map((plant, index) => ({
        ...plant,
        id: `plant_${index + 1}`,
      }));

      return reindexedPlants;
    });

    setPlantCount(prevCount => prevCount - 1);
  };

  const handleSave = () => {
    // Filter out empty plants or validate as needed
    const validPlants = plants.filter(
      plant =>
        plant.name.trim() ||
        plant.value.trim() ||
        plant.x.trim() ||
        plant.y.trim(),
    );

    // Calculate average value
    const average = calculateAverage();

    // Pass both plants data and average to parent
    onSave(validPlants, average);
  };

  const hasData = plants.some(
    plant =>
      plant.name.trim() ||
      plant.value.trim() ||
      plant.x.trim() ||
      plant.y.trim(),
  );

  // Calculate dynamic height based on number of plants
  const calculateMaxHeight = () => {
    // Cap the max height to ensure scrollability
    // When plants exceed 3, limit the ScrollView height so buttons remain accessible
    const baseHeight = 50;
    const heightPerPlant = 180; // Height per plant card (includes remove button)
    const addButtonHeight = 60;
    const saveButtonHeight = 70;
    const padding = 20;

    // Maximum height for the entire component (prevents taking up too much screen space)
    const maxComponentHeight = 600;

    const calculatedHeight =
      baseHeight +
      plantCount * heightPerPlant +
      addButtonHeight +
      saveButtonHeight +
      padding;

    // Return the smaller of calculated height or max height to ensure scrollability
    return Math.min(calculatedHeight, maxComponentHeight);
  };

  // Calculate the ScrollView height separately (excludes buttons at the bottom)
  const calculateScrollViewHeight = () => {
    // Reserve space for "Add Another Plant" and "Save" buttons at the bottom
    const reservedBottomSpace = 150; // Space for both buttons
    const maxScrollHeight = calculateMaxHeight() - reservedBottomSpace;

    // Ensure minimum scroll height
    return Math.max(maxScrollHeight, 200);
  };

  return (
    <View
      style={[
        {
          borderRadius: 12,
          borderWidth: 1,
          borderColor: borderColor,
          marginVertical: 4,
          overflow: 'hidden',
          backgroundColor: containerBgColor, // Moved to top for better shadow calculation
          // iOS Shadow
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          // Android Shadow
          elevation: 2,
        },
        containerStyle,
      ]}>
      {/* Main Header - Always Visible */}
      <TouchableOpacity
        onPress={toggleDropdown}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: headerBgColor,
          borderBottomWidth: isExpanded ? 1 : 0,
          borderBottomColor: borderColor,
        }}
        activeOpacity={0.7}>
        {/* Individual Plants Heading */}
        <Text
          style={{
            fontSize: 14,
            fontFamily: FONTS.BOLD,
            color: isDarkTheme ? accentColor : '#1A6DD2',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            fontWeight: '600',
          }}>
          Individual Plants
        </Text>

        {/* Chevron Icon */}
        <View style={{marginLeft: 12}}>
          {isExpanded ? (
            <CardArrowUp
              width={24}
              height={24}
              color={isDarkTheme ? accentColor : '#1A6DD2'}
            />
          ) : (
            <CardArrowDown
              width={24}
              height={24}
              color={isDarkTheme ? accentColor : '#1A6DD2'}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Expandable Plant Input Fields */}
      <Animated.View
        style={{
          opacity: animatedHeight,
          maxHeight: animatedHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, calculateMaxHeight()],
          }),
        }}>
        <View
          style={{
            backgroundColor: dropdownBgColor,
            borderTopWidth: 1,
            borderTopColor: borderColor,
          }}>
          {/* Loading State - Show until data is ready to display */}
          {!isDataReady || isLoading ? (
            <View
              style={{
                paddingVertical: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ActivityIndicator size="large" color={accentColor} />
              <Text
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  color: subTextColor,
                  fontFamily: FONTS.REGULAR,
                }}>
                Loading plant data...
              </Text>
            </View>
          ) : (
            <>
              <ScrollView
                ref={scrollViewRef}
                style={{
                  maxHeight: calculateScrollViewHeight(),
                }}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingTop: 16,
                  paddingBottom: 16,
                }}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                onScrollBeginDrag={() => Keyboard.dismiss()}
                nestedScrollEnabled={true}
                bounces={true}
                alwaysBounceVertical={plantCount > 3}>
                {plants.map((plant, index) => (
                  <View
                    key={plant.id}
                    style={{
                      marginBottom: 20,
                      padding: 16,
                      backgroundColor: containerBgColor,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: borderColor,
                    }}>
                    {/* Plant Header with Remove Button */}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 12,
                      }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: FONTS.SEMI_BOLD,
                          color: textColor,
                          flex: 1,
                          textAlign: 'center',
                        }}>
                        Plant {index + 1}
                      </Text>
                      {plantCount > 1 && (
                        <TouchableOpacity
                          onPress={() => handleRemovePlant(plant.id)}
                          style={{
                            padding: 4,
                            borderRadius: 4,
                            backgroundColor: isDarkTheme
                              ? '#3A3A3C'
                              : '#FFEBEE',
                          }}
                          activeOpacity={0.7}>
                          <Text
                            style={{
                              color: isDarkTheme ? '#FF6B6B' : '#D32F2F',
                              fontSize: 16,
                              fontWeight: 'bold',
                              paddingHorizontal: 6,
                            }}>
                            ×
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Name and Value Row */}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                      }}>
                      <View style={{flex: 1, marginRight: 8}}>
                        <TextInput
                          ref={(ref: TextInput | null) => {
                            inputRefs.current[`plant_${index}_name`] = ref;
                          }}
                          placeholder="Name"
                          value={plant.name}
                          onChangeText={(value: string) =>
                            updatePlantData(plant.id, 'name', value)
                          }
                          onSubmitEditing={() =>
                            handleInputSubmit(index, 'name')
                          }
                          returnKeyType="next"
                          blurOnSubmit={false}
                          style={{
                            backgroundColor: inputBgColor,
                            borderColor: borderColor,
                            borderWidth: 1,
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            color: textColor,
                            fontSize: 14,
                          }}
                          placeholderTextColor={subTextColor}
                        />
                      </View>
                      <View style={{flex: 1, marginLeft: 8}}>
                        <TextInput
                          ref={(ref: TextInput | null) => {
                            inputRefs.current[`plant_${index}_value`] = ref;
                          }}
                          placeholder="Value"
                          value={plant.value}
                          onChangeText={(value: string) =>
                            updatePlantData(plant.id, 'value', value)
                          }
                          onSubmitEditing={() =>
                            handleInputSubmit(index, 'value')
                          }
                          returnKeyType="next"
                          blurOnSubmit={false}
                          style={{
                            backgroundColor: inputBgColor,
                            borderColor: borderColor,
                            borderWidth: 1,
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            color: textColor,
                            fontSize: 14,
                          }}
                          placeholderTextColor={subTextColor}
                        />
                      </View>
                    </View>

                    {/* X and Y Row */}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <View style={{flex: 1, marginRight: 8}}>
                        <TextInput
                          ref={(ref: TextInput | null) => {
                            inputRefs.current[`plant_${index}_x`] = ref;
                          }}
                          placeholder="X"
                          value={plant.x}
                          onChangeText={(value: string) =>
                            updatePlantData(plant.id, 'x', value)
                          }
                          onSubmitEditing={() => handleInputSubmit(index, 'x')}
                          returnKeyType="next"
                          blurOnSubmit={false}
                          style={{
                            backgroundColor: inputBgColor,
                            borderColor: borderColor,
                            borderWidth: 1,
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            color: textColor,
                            fontSize: 14,
                          }}
                          placeholderTextColor={subTextColor}
                        />
                      </View>
                      <View style={{flex: 1, marginLeft: 8}}>
                        <TextInput
                          ref={(ref: TextInput | null) => {
                            inputRefs.current[`plant_${index}_y`] = ref;
                          }}
                          placeholder="Y"
                          value={plant.y}
                          onChangeText={(value: string) =>
                            updatePlantData(plant.id, 'y', value)
                          }
                          onSubmitEditing={() => handleInputSubmit(index, 'y')}
                          returnKeyType={
                            index === plantCount - 1 ? 'done' : 'next'
                          }
                          blurOnSubmit={false}
                          style={{
                            backgroundColor: inputBgColor,
                            borderColor: borderColor,
                            borderWidth: 1,
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            color: textColor,
                            fontSize: 14,
                          }}
                          placeholderTextColor={subTextColor}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Add Plant Button */}
              <View style={{paddingHorizontal: 16, paddingTop: 8}}>
                <TouchableOpacity
                  onPress={handleAddPlant}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDarkTheme ? '#2C2C2E' : '#F0F0F0',
                    borderWidth: 1,
                    borderColor: borderColor,
                    borderRadius: 8,
                    borderStyle: 'dashed',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                  }}
                  activeOpacity={0.7}>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: accentColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 8,
                    }}>
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 22,
                        fontWeight: 'bold',
                        lineHeight: 24,
                      }}>
                      +
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: FONTS.SEMI_BOLD,
                      color: accentColor,
                    }}>
                    Add Plant
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Save Button */}
              <View style={{padding: 16, paddingTop: 12}}>
                <Button
                  title="Save Plants Data"
                  onPress={handleSave}
                  loading={isSaving}
                  disabled={isSaving || !hasData}
                  containerStyle={{
                    backgroundColor:
                      hasData && !isSaving
                        ? accentColor
                        : isDarkTheme
                        ? '#3A3A3C'
                        : '#E5E5EA',
                  }}
                  customLabelStyle={{
                    color: hasData && !isSaving ? '#FFFFFF' : '#8E8E93',
                  }}
                />
              </View>
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

export default IndividualPlantsManager;
