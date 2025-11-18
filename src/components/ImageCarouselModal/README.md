# ImageCarouselModal Component

A React Native component that displays multiple images in a carousel format using BottomSheetModal. Perfect for viewing plot images with navigation arrows, thumbnail strip, download and share functionality.

## Features

- 📱 **BottomSheet Modal** - Slides up from bottom with smooth animations
- 🖼️ **Image Carousel** - Swipe through multiple images with left/right arrows
- 🖼️ **Thumbnail Strip** - Quick navigation between images
- 📥 **Download** - Save images to device gallery
- 📤 **Share** - Share images with other apps
- 🔄 **Loading States** - Shows loading indicators while images load
- ℹ️ **Image Info** - Display upload date and location metadata
- 🎯 **Responsive** - Adapts to different screen sizes

## Usage

### Basic Implementation

```tsx
import React, {useState} from 'react';
import {ImageCarouselModal} from '../../components';

const MyScreen = () => {
  const [isCarouselVisible, setIsCarouselVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [initialIndex, setInitialIndex] = useState(0);

  const images = [
    {
      url: 'https://example.com/image1.jpg',
      uploadedOn: '2024-01-15T10:30:00Z',
      id: 'plot_1_image_1',
    },
    {
      url: 'https://example.com/image2.jpg',
      uploadedOn: '2024-01-15T11:45:00Z',
      id: 'plot_1_image_2',
    },
  ];

  const openCarousel = (startIndex = 0) => {
    setSelectedImages(images);
    setInitialIndex(startIndex);
    setIsCarouselVisible(true);
  };

  return (
    <>
      {/* Your screen content */}
      <Pressable onPress={() => openCarousel(0)}>
        <Text>View Images</Text>
      </Pressable>

      {/* Image Carousel Modal */}
      <ImageCarouselModal
        isVisible={isCarouselVisible}
        images={selectedImages}
        initialIndex={initialIndex}
        plotNumber="Plot 123"
        fieldName="Field Location"
        onClose={() => setIsCarouselVisible(false)}
      />
    </>
  );
};
```

### Integration in Plots Screen

The component has been integrated into the Plots screen and works as follows:

1. **Attachment Icon Press**: When user taps the attachment icon in matrix view

   - If images exist: Opens carousel starting at first image
   - If no images: Navigates to AddImage screen

2. **Thumbnail Press**: When user taps image thumbnail in plot view
   - Opens carousel starting at the selected image index

```tsx
// Example from Plots screen integration
const openImageCarousel = (plot: any, initialIndex: number = 0) => {
  if (plot.imageUrls && plot.imageUrls.length > 0) {
    const formattedImages = plot.imageUrls.map((imageUrl: string, index: number) => ({
      url: imageUrl,
      id: `${plot.plotNumber}_${index}`,
      uploadedOn: new Date().toISOString(),
    }));

    setSelectedPlotImages(formattedImages);
    setSelectedImageIndex(Math.max(0, Math.min(initialIndex, formattedImages.length - 1)));
    setIsImageCarouselVisible(true);
  } else {
    Toast.error({message: 'No images available for this plot'});
  }
};

// Attachment icon press handler
onPress={() => {
  if (plot.imageUrls && plot.imageUrls.length > 0) {
    openImageCarousel(plot, 0);
  } else {
    navigation.navigate('AddImage', {
      plotNumber: plot.plotNumber,
      id, type, experimentID, locationID,
    } as any);
  }
}}

// Thumbnail press handler
onThumbnailPress={(index: number) => {
  openImageCarousel(selectedPlot, index);
}}
```

## Props

| Prop           | Type          | Required | Default | Description                   |
| -------------- | ------------- | -------- | ------- | ----------------------------- |
| `isVisible`    | `boolean`     | ✅       | -       | Controls modal visibility     |
| `images`       | `ImageData[]` | ✅       | -       | Array of image objects        |
| `initialIndex` | `number`      | ❌       | `0`     | Starting image index          |
| `plotNumber`   | `string`      | ❌       | -       | Plot identifier for display   |
| `fieldName`    | `string`      | ❌       | -       | Field location name           |
| `onClose`      | `() => void`  | ✅       | -       | Callback when modal is closed |

### ImageData Interface

```tsx
interface ImageData {
  url: string; // Image URL (required)
  uploadedOn?: string; // ISO date string
  imagePath?: string; // Local file path (for downloads)
  id?: string | number; // Unique identifier
}
```

## Navigation Controls

- **Left/Right Arrows**: Navigate between images (only shown when multiple images)
- **Thumbnail Strip**: Click any thumbnail to jump to that image
- **Swipe Gestures**: Native swipe support through image viewer

## Actions

### Download

- Requests storage permissions on Android
- Saves to Pictures/Download directory
- Shows success/error alerts
- Handles both local and remote images

### Share

- Uses react-native-share
- Shares image URL with other apps
- Includes custom message with plot/field info

## Styling

The component uses the app's theme system and adapts to:

- Light/Dark themes through `useTheme()` hook
- Safe area insets for proper spacing
- Device dimensions for responsive layout

## Dependencies

- `@gorhom/bottom-sheet` - Bottom sheet modal
- `react-native-fs` - File system operations
- `react-native-share` - Share functionality
- `date-fns` - Date formatting
- `react-native-safe-area-context` - Safe area handling

## Files Created/Modified

### New Files:

- `src/components/ImageCarouselModal/index.tsx` - Main component
- `src/components/ImageCarouselModal/README.md` - This documentation

### Modified Files:

- `src/components/index.tsx` - Added export
- `src/screens/app-screens/Plots/index.tsx` - Integration logic

## Error Handling

- **No Images**: Shows error toast and prevents modal opening
- **Network Errors**: Graceful handling of download/share failures
- **Permission Denied**: Alerts user about storage permissions
- **Invalid Image Index**: Automatically corrects to valid range

## Performance

- **Lazy Loading**: Images load on demand
- **Loading States**: Visual feedback during image loading
- **Memory Efficient**: Only loads visible images
- **Background Processing**: Non-blocking download/share operations
