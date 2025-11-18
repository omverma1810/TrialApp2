/**
 * Utility functions for handling experiment type display
 */

/**
 * Formats experiment type for display
 * Converts "line" to "Line Dev" for UI display
 * @param experimentType - The raw experiment type from API
 * @returns Formatted experiment type for display
 */
export const formatExperimentTypeForDisplay = (
  experimentType: string,
): string => {
  if (!experimentType) return '';

  // Convert "line" to "Line Dev" for display
  if (experimentType.toLowerCase() === 'line') {
    return 'Line Dev';
  }

  // Return other types as-is (capitalize first letter for consistency)
  return experimentType.charAt(0).toUpperCase() + experimentType.slice(1);
};

/**
 * Checks if an experiment type is line-based
 * @param experimentType - The experiment type to check
 * @returns true if the experiment type is "line"
 */
export const isLineExperiment = (experimentType: string): boolean => {
  return experimentType?.toLowerCase() === 'line';
};
