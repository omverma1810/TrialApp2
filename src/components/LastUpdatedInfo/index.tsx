import React, {useState} from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Text from '../Text';
import MapViewModal from '../MapView';
import {FONTS} from '../../theme/fonts';
import {CardArrowDown, CardArrowUp, Clock} from '../../assets/icons/svgs';
import MapIcon from '../../assets/icons/svgs/MapIcon';
import {LastUpdatedInfoProps} from './types';

const LastUpdatedInfo: React.FC<LastUpdatedInfoProps> = ({
  traitData,
  visible = true,
  containerStyle,
  theme = 'light',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animatedHeight] = useState(new Animated.Value(0));
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [showInlineMap, setShowInlineMap] = useState(false);

  // Get screen dimensions for responsive map sizing
  const {width: screenWidth} = Dimensions.get('window');

  // Don't render if not visible or if no trait data is available
  if (!visible || !traitData) {
    return null;
  }

  // Debug logging to see what data we receive

  // Check if we have essential update data (including coordinates)
  const hasValidData =
    traitData.lastUpdatedAt ||
    traitData.updateTime ||
    traitData.updateBy ||
    traitData.locationName ||
    (traitData.lat && traitData.long); // Also consider coordinates as valid data

  // Don't render the component if we don't have valid data
  if (!hasValidData) {
    return null;
  }

  const isDarkTheme = theme === 'dark';
  const containerBgColor = isDarkTheme ? '#2C2C2E' : '#FFFFFF';
  const textColor = isDarkTheme ? '#FFFFFF' : '#1C1C1E';
  const subTextColor = isDarkTheme ? '#AEAEB2' : '#8E8E93';
  const borderColor = isDarkTheme ? '#3A3A3C' : '#E5E5EA';
  const dropdownBgColor = isDarkTheme ? '#1C1C1E' : '#F8F9FA';

  const toggleDropdown = () => {
    const toValue = isExpanded ? 0 : 1;

    Animated.timing(animatedHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setIsExpanded(!isExpanded);

    // Also toggle inline map when expanding
    if (!isExpanded && hasCoordinates) {
      setShowInlineMap(true);
    } else {
      setShowInlineMap(false);
    }
  };

  const formatDisplayDate = (date?: string) => {
    if (!date) return '-';
    // Handle different date formats that might come from API
    try {
      // If it's already in DD/MM/YYYY format
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
        return date;
      }
      // If it's in ISO format, convert it
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    } catch {
      return date;
    }
  };

  const formatDisplayTime = (time?: string) => {
    if (!time) return '-';
    // Handle different time formats
    try {
      // If time includes seconds, remove them for cleaner display
      if (time.includes(':')) {
        const parts = time.split(':');
        if (parts.length >= 2) {
          return `${parts[0]}:${parts[1]}`;
        }
      }
      return time;
    } catch {
      return time;
    }
  };

  const displayDate = formatDisplayDate(traitData?.lastUpdatedAt);
  const displayTime = formatDisplayTime(traitData?.updateTime);
  const updatedBy = traitData?.updateBy || '-';
  const updateLocation = traitData?.locationName || '-';

  // Use real coordinates from API data only
  const latitude = traitData?.lat;
  const longitude = traitData?.long;
  const hasCoordinates =
    latitude !== undefined &&
    longitude !== undefined &&
    latitude !== null &&
    longitude !== null &&
    !isNaN(Number(latitude)) &&
    !isNaN(Number(longitude)) &&
    Math.abs(Number(latitude)) <= 90 &&
    Math.abs(Number(longitude)) <= 180;

  // Convert coordinates to numbers for map usage
  const numLatitude = hasCoordinates ? Number(latitude) : 0;
  const numLongitude = hasCoordinates ? Number(longitude) : 0;

  const handleMapPress = () => {
    if (hasCoordinates) {
      setIsMapVisible(true);
    }
  };

  const handleMapClose = () => {
    setIsMapVisible(false);
  };

  return (
    <View
      style={[
        {
          backgroundColor: containerBgColor,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: borderColor,
          marginVertical: 4,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2,
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
          backgroundColor: containerBgColor,
        }}
        activeOpacity={0.7}>
        {/* Clock Icon */}
        <View style={{marginRight: 6}}>
          <Clock width={28} height={18} color={subTextColor} />
        </View>

        {/* Last Updated Heading */}
        <Text
          style={{
            fontSize: 14,
            fontFamily: FONTS.BOLD,
            color: subTextColor,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            fontWeight: '600',
          }}>
          Last Updated
        </Text>

        {/* Chevron Icon - positioned at the end of heading */}
        <View style={{marginLeft: 12}}>
          {isExpanded ? (
            <CardArrowUp width={24} height={24} color={subTextColor} />
          ) : (
            <CardArrowDown width={24} height={24} color={subTextColor} />
          )}
        </View>
      </TouchableOpacity>

      {/* Expandable Details */}
      <Animated.View
        style={{
          opacity: animatedHeight,
          maxHeight: animatedHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [
              0,
              hasCoordinates && showInlineMap
                ? 500
                : hasCoordinates
                ? 200
                : 160,
            ], // Increased height for coordinates and map
          }),
        }}>
        <View
          style={{
            backgroundColor: dropdownBgColor,
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderTopWidth: 1,
            borderTopColor: borderColor,
          }}>
          {/* Date */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <Text
              style={{
                fontSize: 12,
                fontFamily: FONTS.REGULAR,
                color: subTextColor,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
              Date:
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: FONTS.MEDIUM,
                color: textColor,
              }}>
              {displayDate}
            </Text>
          </View>

          {/* Time */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <Text
              style={{
                fontSize: 12,
                fontFamily: FONTS.REGULAR,
                color: subTextColor,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
              Time:
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: FONTS.MEDIUM,
                color: textColor,
              }}>
              {displayTime}
            </Text>
          </View>

          {/* Updated By */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <Text
              style={{
                fontSize: 12,
                fontFamily: FONTS.REGULAR,
                color: subTextColor,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
              Updated by:
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: FONTS.MEDIUM,
                color: textColor,
                textAlign: 'right',
                flex: 1,
                marginLeft: 8,
              }}>
              {updatedBy}
            </Text>
          </View>

          {/* Location */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: hasCoordinates && showInlineMap ? 12 : 4,
            }}>
            <Text
              style={{
                fontSize: 12,
                fontFamily: FONTS.REGULAR,
                color: subTextColor,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
              Location:
            </Text>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                marginLeft: 8,
              }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: FONTS.MEDIUM,
                  color: textColor,
                  textAlign: 'right',
                  flex: 1,
                  marginRight: hasCoordinates ? 8 : 0,
                }}>
                {updateLocation}
              </Text>
              {hasCoordinates && (
                <TouchableOpacity
                  onPress={handleMapPress}
                  style={{
                    padding: 4,
                    borderRadius: 6,
                    backgroundColor: isDarkTheme ? '#3A3A3C' : '#F2F2F7',
                  }}
                  activeOpacity={0.7}>
                  <MapIcon
                    width={16}
                    height={16}
                    color={isDarkTheme ? '#FFFFFF' : '#1C1C1E'}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Coordinates Display */}
          {hasCoordinates && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: showInlineMap ? 12 : 4,
              }}>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: FONTS.REGULAR,
                  color: subTextColor,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                Coordinates:
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: FONTS.MEDIUM,
                  color: textColor,
                  textAlign: 'right',
                  fontVariant: ['tabular-nums'],
                }}>
                {numLatitude.toFixed(6)}, {numLongitude.toFixed(6)}
              </Text>
            </View>
          )}

          {/* Interactive Inline Map */}
          {hasCoordinates && showInlineMap && (
            <View
              style={{
                height: 180,
                borderRadius: 8,
                overflow: 'hidden',
                marginTop: 8,
                borderWidth: 1,
                borderColor: borderColor,
                backgroundColor: isDarkTheme ? '#1C1C1E' : '#F8F9FA',
                position: 'relative',
              }}>
              <MapView
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 8,
                }}
                provider={
                  Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined
                }
                region={{
                  latitude: numLatitude,
                  longitude: numLongitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                showsUserLocation={false}
                showsMyLocationButton={false}
                showsCompass={false}
                showsScale={false}
                zoomEnabled={true}
                scrollEnabled={true}
                pitchEnabled={false}
                rotateEnabled={false}
                mapType="satellite"
                onMapReady={() => {}}>
                <Marker
                  coordinate={{
                    latitude: numLatitude,
                    longitude: numLongitude,
                  }}
                  title={updateLocation}
                  description={`${numLatitude.toFixed(
                    6,
                  )}, ${numLongitude.toFixed(6)}`}
                />
              </MapView>

              {/* Map Overlay Controls - Fixed positioning for iOS */}
              <TouchableOpacity
                onPress={handleMapPress}
                activeOpacity={0.8}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                  zIndex: 1000,
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: FONTS.SEMI_BOLD,
                    color: '#007AFF',
                    fontWeight: '600',
                  }}>
                  Full Screen
                </Text>
              </TouchableOpacity>

              {/* Map Loading Overlay */}
            </View>
          )}
        </View>
      </Animated.View>

      {/* Map Modal - only render if coordinates are available */}
      {hasCoordinates && (
        <MapViewModal
          visible={isMapVisible}
          onClose={handleMapClose}
          latitude={numLatitude}
          longitude={numLongitude}
          locationName={updateLocation}
          theme={theme}
        />
      )}
    </View>
  );
};

export default LastUpdatedInfo;
