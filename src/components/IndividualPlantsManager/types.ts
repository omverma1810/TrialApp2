import {ViewStyle} from 'react-native';

export interface PlantData {
  /**
   * Unique identifier for the plant
   */
  id: string;

  /**
   * Display name of the plant
   */
  name: string;

  /**
   * Value associated with the plant
   */
  value: string;

  /**
   * X coordinate of the plant
   */
  x: string;

  /**
   * Y coordinate of the plant
   */
  y: string;
}

export interface IndividualPlantsManagerProps {
  /**
   * Total number of plants to display
   */
  totalPlants?: number;

  /**
   * Array of plant data
   */
  plantsData?: PlantData[];

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

  /**
   * Callback when save button is pressed
   * @param plantsData - Array of plant data
   * @param average - Calculated average of all plant values (null if no valid values)
   */
  onSave?: (plantsData: PlantData[], average: number | null) => void;

  /**
   * Callback when average value changes in real-time (as user types)
   * @param average - Calculated average of all plant values (null if no valid values)
   */
  onAverageChange?: (average: number | null) => void;

  /**
   * Loading state for save operation
   */
  isSaving?: boolean;

  /**
   * Loading state for fetching individual plants data from API
   */
  isLoading?: boolean;

  /**
   * Callback when component expands (to minimize other components)
   */
  onExpand?: () => void;

  /**
   * Callback when component collapses (to restore other components)
   */
  onCollapse?: () => void;
}
