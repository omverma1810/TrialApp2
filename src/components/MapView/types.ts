export interface MapViewProps {
  /**
   * Whether the map modal is visible
   */
  visible: boolean;

  /**
   * Callback when the modal should be closed
   */
  onClose: () => void;

  /**
   * Latitude coordinate for the location
   */
  latitude: number;

  /**
   * Longitude coordinate for the location
   */
  longitude: number;

  /**
   * Optional name/description for the location
   */
  locationName?: string;

  /**
   * Color theme for the map
   */
  theme?: 'light' | 'dark';
}
