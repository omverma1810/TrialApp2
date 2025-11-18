import {ViewStyle} from 'react-native';

export interface UpdateData {
  /**
   * Date when the trait was last updated (DD/MM/YYYY or ISO format)
   */
  lastUpdatedAt?: string;

  /**
   * Time when the trait was last updated (HH:MM format)
   */
  updateTime?: string;

  /**
   * Name of the person who updated the trait
   */
  updateBy?: string;

  /**
   * Location where the update was made
   */
  locationName?: string;

  /**
   * Latitude coordinate for the update location
   */
  lat?: number;

  /**
   * Longitude coordinate for the update location
   */
  long?: number;
}

export interface LastUpdatedInfoProps {
  /**
   * The trait data containing update information
   */
  traitData?: UpdateData | null;

  /**
   * Whether to show the component (default: true)
   */
  visible?: boolean;

  /**
   * Custom style for the container
   */
  containerStyle?: ViewStyle;

  /**
   * Color theme for the component
   */
  theme?: 'light' | 'dark';
}
