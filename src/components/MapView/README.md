# Google Maps Setup Guide

## Important: Google Maps API Key Setup

Before using the MapView component, you need to set up your Google Maps API key:

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the Maps SDK for Android and iOS
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

### 2. iOS Setup

1. Open `/ios/TrialApp2/Info.plist`
2. Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key

### 3. Android Setup

1. Open `/android/app/src/main/AndroidManifest.xml`
2. Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key

## Usage

```tsx
import {MapView} from '../components/MapView';

// Open map modal
<MapView
  visible={isMapVisible}
  coordinates={{latitude: 40.7128, longitude: -74.006}}
  onClose={() => setIsMapVisible(false)}
/>;
```

## Features

- Full-screen modal map display
- Custom marker with location coordinates
- Fallback to static map image if loading fails
- Cross-platform (Android & iOS)

## Security Notes

- Keep your API keys secure
- Consider using environment variables for sensitive data
- Monitor usage in Google Cloud Console
- Set up API key restrictions for production apps
