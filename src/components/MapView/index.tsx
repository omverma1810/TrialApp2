import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Text from '../Text';
import {FONTS} from '../../theme/fonts';
import {MapViewProps} from './types';

const MapViewComponent: React.FC<MapViewProps> = ({
  visible,
  onClose,
  latitude,
  longitude,
  locationName = 'Selected Location',
  theme = 'light',
}) => {
  const isDarkTheme = theme === 'dark';
  const insets = useSafeAreaInsets();

  // track if map failed to load so we can show safe static-image fallback
  const [mapLoadFailed, setMapLoadFailed] = useState(false);
  const [mapReady, setMapReady] = useState(false);


  // controlled region to ensure the map always centers on provided coordinates
  const initialRegion = {
    latitude: latitude,
    longitude: longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
  const [region, setRegion] = useState(initialRegion);

  useEffect(() => {
    if (
      typeof latitude === 'number' &&
      !Number.isNaN(latitude) &&
      typeof longitude === 'number' &&
      !Number.isNaN(longitude) &&
      Math.abs(latitude) <= 90 &&
      Math.abs(longitude) <= 180
    ) {
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      // try to reset any previous load-fail state when coords update
      setMapLoadFailed(false);
      setMapReady(false); // Reset map ready state for new coordinates
    } else {
      setMapLoadFailed(true);
    }
  }, [latitude, longitude]);

  const handleMapError = useCallback((error?: any) => {
    // Only set fallback for actual map errors, not timeouts
    setMapLoadFailed(true);
    Alert.alert(
      'Map Error',
      'Map failed to load due to an error. Showing alternative options.',
      [{text: 'OK'}],
    );
  }, []);

  // coerce incoming coordinates to numbers (defensive)
  const latNum = Number(latitude);
  const lonNum = Number(longitude);
  const coordinates = {
    latitude: Number.isFinite(latNum) && Math.abs(latNum) <= 90 ? latNum : 0,
    longitude: Number.isFinite(lonNum) && Math.abs(lonNum) <= 180 ? lonNum : 0,
  };

  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

  // Simplified effect for coordinate validation - only set fallback for truly invalid coordinates
  useEffect(() => {
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      isNaN(latitude) ||
      isNaN(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    ) {
      setMapLoadFailed(true);
    } else {
      // Reset fallback state for valid coordinates
      setMapLoadFailed(false);
      setMapReady(false);
    }
  }, [latitude, longitude]);

  // ensure hooks are always called even when modal is hidden
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={
        Platform.OS === 'ios' ? 'overFullScreen' : 'fullScreen'
      }
      statusBarTranslucent={true}
      transparent={false}
      onRequestClose={onClose}>
      <View
        style={[
          styles.container,
          {backgroundColor: isDarkTheme ? '#1C1C1E' : '#FFFFFF'},
        ]}>
        <StatusBar
          barStyle={isDarkTheme ? 'light-content' : 'dark-content'}
          backgroundColor={isDarkTheme ? '#1C1C1E' : '#FFFFFF'}
        />

        {/* Header with proper safe area handling */}
        <View
          style={[
            styles.headerWrapper,
            {
              paddingTop: insets.top,
              backgroundColor: isDarkTheme ? '#1C1C1E' : '#FFFFFF',
            },
          ]}>
          <View
            style={[
              styles.header,
              {
                backgroundColor: isDarkTheme ? '#1C1C1E' : '#FFFFFF',
                borderBottomColor: isDarkTheme ? '#3A3A3C' : '#E5E5EA',
              },
            ]}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Text
                  style={[
                    styles.headerTitle,
                    {color: isDarkTheme ? '#FFFFFF' : '#1C1C1E'},
                  ]}>
                  Location Details
                </Text>
                <Text
                  style={[
                    styles.headerSubtitle,
                    {color: isDarkTheme ? '#AEAEB2' : '#8E8E93'},
                  ]}>
                  {locationName}
                </Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={[
                  styles.closeButton,
                  {backgroundColor: isDarkTheme ? '#3A3A3C' : '#F2F2F7'},
                ]}
                activeOpacity={0.7}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Text
                  style={[
                    styles.closeButtonText,
                    {color: isDarkTheme ? '#FFFFFF' : '#1C1C1E'},
                  ]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          {!mapLoadFailed ? (
            <MapView
              style={styles.map}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              region={region}
              onRegionChangeComplete={r => setRegion(r)}
              onMapReady={() => {
                setMapReady(true);
              }}
              showsUserLocation={false}
              showsMyLocationButton={false}
              showsCompass={true}
              showsScale={false}
              zoomEnabled={true}
              scrollEnabled={true}
              pitchEnabled={true}
              rotateEnabled={true}
              mapType="satellite">
              <Marker
                coordinate={coordinates}
                title={locationName}
                description={`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`}
              />
            </MapView>
          ) : (
            // Fallback when map fails to load
            <View style={styles.fallbackContainer}>
              <View style={{alignItems: 'center', marginBottom: 24}}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: FONTS.BOLD,
                    color: isDarkTheme ? '#FFFFFF' : '#1C1C1E',
                    marginBottom: 8,
                  }}>
                  📍 Map Unavailable
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: FONTS.REGULAR,
                    color: isDarkTheme ? '#AEAEB2' : '#8E8E93',
                    textAlign: 'center',
                    marginBottom: 16,
                  }}>
                  Unable to load the map at this time.{'\n'}
                  You can open the location in Maps app instead.
                </Text>
                <View style={{alignItems: 'center'}}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: FONTS.MEDIUM,
                      color: isDarkTheme ? '#FFFFFF' : '#1C1C1E',
                      marginBottom: 4,
                    }}>
                    {locationName}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: FONTS.REGULAR,
                      color: isDarkTheme ? '#AEAEB2' : '#8E8E93',
                      fontVariant: ['tabular-nums'],
                    }}>
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </Text>
                </View>
              </View>
              <View style={styles.fallbackActions}>
                <TouchableOpacity
                  style={[
                    styles.openExternal,
                    {
                      backgroundColor: '#007AFF',
                    },
                  ]}
                  onPress={() => {
                    if (Platform.OS === 'ios') {
                      // open location in Apple Maps for iOS
                      const url = `http://maps.apple.com/?ll=${latitude},${longitude}&q=${encodeURIComponent(
                        locationName,
                      )}`;
                      Linking.openURL(url).catch(() => {
                        // fallback to web search
                        const web = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                        Linking.openURL(web);
                      });
                    } else {
                      // open location in Google Maps for Android
                      const url = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(
                        locationName,
                      )})`;
                      Linking.openURL(url).catch(() => {
                        // fallback to Google Maps web
                        const web = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                        Linking.openURL(web);
                      });
                    }
                  }}>
                  <Text style={[styles.openExternalText, {color: '#FFFFFF'}]}>
                    {Platform.OS === 'ios'
                      ? 'Open in Apple Maps'
                      : 'Open in Google Maps'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Location Info Footer */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: isDarkTheme ? '#1C1C1E' : '#FFFFFF',
              borderTopColor: isDarkTheme ? '#3A3A3C' : '#E5E5EA',
              paddingBottom: Math.max(insets.bottom, 16) + 16,
            },
          ]}>
          <View style={styles.coordinatesContainer}>
            <Text
              style={[
                styles.coordinatesLabel,
                {color: isDarkTheme ? '#AEAEB2' : '#8E8E93'},
              ]}>
              Coordinates
            </Text>
            <Text
              style={[
                styles.coordinatesText,
                {color: isDarkTheme ? '#FFFFFF' : '#1C1C1E'},
              ]}>
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    zIndex: 10,
    elevation: 10,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.BOLD,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontFamily: FONTS.MEDIUM,
    lineHeight: 20,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 24,
  },
  fallbackActions: {
    alignItems: 'center',
  },
  openExternal: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  openExternalText: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  coordinatesContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  coordinatesLabel: {
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
  },
  openMapsButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  openMapsButtonText: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    color: '#FFFFFF',
  },
});

export default MapViewComponent;
