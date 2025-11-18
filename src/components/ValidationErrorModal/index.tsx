import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import useTheme from '../../theme/hooks/useTheme';

export interface ValidationError {
  plotNumber: string;
  plotId?: number | string;
  traitName: string;
  traitId?: number;
  value: string;
  errorMessage?: string;
  validationStatus: boolean;
  expectedRange?: {
    minimum?: number | string;
    maximum?: number | string;
    unit?: string;
  };
}

export interface ValidationErrorModalProps {
  isVisible: boolean;
  errors: ValidationError[];
  onClose: () => void;
  onPlotSelect?: (plotNumber: string, traitName: string) => void;
  onRetryAll?: () => void;
  title?: string;
}

type ErrorDisplayMode = 'all' | 'plots' | 'traits';

const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({
  isVisible,
  errors,
  onClose,
  onPlotSelect,
  onRetryAll,
  title = 'Validation Errors',
}) => {
  const {COLORS, FONTS} = useTheme();
  const [displayMode, setDisplayMode] = useState<ErrorDisplayMode>('all');
  const [expandedPlots, setExpandedPlots] = useState<Set<string>>(new Set());

  // Group errors by plot for better organization
  const errorsByPlot = useMemo(() => {
    const grouped: Record<string, ValidationError[]> = {};
    errors.forEach(error => {
      if (!grouped[error.plotNumber]) {
        grouped[error.plotNumber] = [];
      }
      grouped[error.plotNumber].push(error);
    });
    return grouped;
  }, [errors]);

  // Group errors by trait for trait-focused view
  const errorsByTrait = useMemo(() => {
    const grouped: Record<string, ValidationError[]> = {};
    errors.forEach(error => {
      if (!grouped[error.traitName]) {
        grouped[error.traitName] = [];
      }
      grouped[error.traitName].push(error);
    });
    return grouped;
  }, [errors]);

  // Summary statistics
  const summary = useMemo(() => {
    const uniquePlots = new Set(errors.map(e => e.plotNumber));
    const uniqueTraits = new Set(errors.map(e => e.traitName));
    return {
      totalErrors: errors.length,
      affectedPlots: uniquePlots.size,
      affectedTraits: uniqueTraits.size,
      plotNumbers: Array.from(uniquePlots).sort(
        (a, b) => parseInt(a) - parseInt(b),
      ),
      traitNames: Array.from(uniqueTraits).sort(),
    };
  }, [errors]);

  const togglePlotExpansion = (plotNumber: string) => {
    const newExpanded = new Set(expandedPlots);
    if (newExpanded.has(plotNumber)) {
      newExpanded.delete(plotNumber);
    } else {
      newExpanded.add(plotNumber);
    }
    setExpandedPlots(newExpanded);
  };

  const handlePlotTraitPress = (plotNumber: string, traitName: string) => {
    onPlotSelect?.(plotNumber, traitName);
    onClose();
  };

  const renderModeSelector = () => (
    <View style={styles.modeSelectorContainer}>
      {[
        {key: 'all', label: 'All Errors'},
        {key: 'plots', label: 'By Plots'},
        {key: 'traits', label: 'By Traits'},
      ].map(mode => (
        <Pressable
          key={mode.key}
          style={[
            styles.modeButton,
            {
              backgroundColor:
                displayMode === mode.key
                  ? COLORS.APP.SECONDARY_COLOR
                  : COLORS.APP.BACKGROUND_COLOR,
              borderColor: COLORS.COMPONENTS.TAB.BORDER_COLOR,
            },
          ]}
          onPress={() => setDisplayMode(mode.key as ErrorDisplayMode)}>
          <Text
            style={[
              styles.modeButtonText,
              {
                color:
                  displayMode === mode.key
                    ? COLORS.APP.BACKGROUND_COLOR
                    : COLORS.COMPONENTS.TEXT.PRIMARY_COLOR,
              },
            ]}>
            {mode.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const renderSummaryCard = () => (
    <View
      style={[
        styles.summaryCard,
        {backgroundColor: COLORS.COMPONENTS.TOAST.ERROR_BACKGROUND_COLOR},
      ]}>
      <Text
        style={[
          styles.summaryTitle,
          {color: COLORS.COMPONENTS.TOAST.ERROR_TEXT_COLOR},
        ]}>
        Validation Summary
      </Text>
      <View style={styles.summaryRow}>
        <Text
          style={[
            styles.summaryText,
            {color: COLORS.COMPONENTS.TOAST.ERROR_TEXT_COLOR},
          ]}>
          {summary.totalErrors} errors across {summary.affectedPlots} plots and{' '}
          {summary.affectedTraits} traits
        </Text>
      </View>

      {summary.affectedPlots <= 10 && (
        <View style={styles.summaryRow}>
          <Text
            style={[
              styles.summaryLabel,
              {color: COLORS.COMPONENTS.TOAST.ERROR_TEXT_COLOR},
            ]}>
            Affected Plots:
          </Text>
          <Text
            style={[
              styles.summaryValue,
              {color: COLORS.COMPONENTS.TOAST.ERROR_TEXT_COLOR},
            ]}>
            {summary.plotNumbers.join(', ')}
          </Text>
        </View>
      )}

      {summary.affectedTraits <= 5 && (
        <View style={styles.summaryRow}>
          <Text
            style={[
              styles.summaryLabel,
              {color: COLORS.COMPONENTS.TOAST.ERROR_TEXT_COLOR},
            ]}>
            Affected Traits:
          </Text>
          <Text
            style={[
              styles.summaryValue,
              {color: COLORS.COMPONENTS.TOAST.ERROR_TEXT_COLOR},
            ]}>
            {summary.traitNames.join(', ')}
          </Text>
        </View>
      )}
    </View>
  );

  const renderErrorItem = (error: ValidationError, showPlotNumber = true) => (
    <Pressable
      key={`${error.plotNumber}-${error.traitName}`}
      style={[styles.errorItem, {borderColor: '#FF6B6B'}]}
      onPress={() => handlePlotTraitPress(error.plotNumber, error.traitName)}>
      <View style={styles.errorHeader}>
        {showPlotNumber && (
          <Text
            style={[styles.plotNumber, {color: COLORS.APP.SECONDARY_COLOR}]}>
            Plot {error.plotNumber}
          </Text>
        )}
        <Text
          style={[
            styles.traitName,
            {color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR},
          ]}>
          {error.traitName}
        </Text>
      </View>

      <View style={styles.errorDetails}>
        <Text
          style={[
            styles.errorValue,
            {color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR},
          ]}>
          Value: "{error.value}"
        </Text>
        {error.expectedRange &&
          (error.expectedRange.minimum !== undefined ||
            error.expectedRange.maximum !== undefined) && (
            <Text
              style={[
                styles.rangeText,
                {color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR},
              ]}>
              Expected Range: {error.expectedRange.minimum ?? '—'} -{' '}
              {error.expectedRange.maximum ?? '—'}
              {error.expectedRange.unit && ` ${error.expectedRange.unit}`}
            </Text>
          )}
        {error.errorMessage && (
          <Text style={[styles.errorMessage, {color: '#FF6B6B'}]}>
            {error.errorMessage}
          </Text>
        )}
      </View>
    </Pressable>
  );

  const renderAllErrorsView = () => (
    <ScrollView style={styles.errorsList}>
      {errors.map(error => renderErrorItem(error))}
    </ScrollView>
  );

  const renderPlotGroupedView = () => (
    <ScrollView style={styles.errorsList}>
      {Object.entries(errorsByPlot).map(([plotNumber, plotErrors]) => (
        <View key={plotNumber} style={styles.plotGroup}>
          <Pressable
            style={[
              styles.plotGroupHeader,
              {backgroundColor: COLORS.COMPONENTS.TAB.BACKGROUND_COLOR},
            ]}
            onPress={() => togglePlotExpansion(plotNumber)}>
            <Text
              style={[
                styles.plotGroupTitle,
                {color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR},
              ]}>
              Plot {plotNumber} ({plotErrors.length} error
              {plotErrors.length > 1 ? 's' : ''})
            </Text>
            <Text
              style={[
                styles.expandIcon,
                {color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR},
              ]}>
              {expandedPlots.has(plotNumber) ? '▼' : '▶'}
            </Text>
          </Pressable>

          {expandedPlots.has(plotNumber) && (
            <View style={styles.plotGroupContent}>
              {plotErrors.map(error => renderErrorItem(error, false))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderTraitGroupedView = () => (
    <ScrollView style={styles.errorsList}>
      {Object.entries(errorsByTrait).map(([traitName, traitErrors]) => (
        <View key={traitName} style={styles.traitGroup}>
          <View
            style={[
              styles.traitGroupHeader,
              {backgroundColor: COLORS.COMPONENTS.CHIP.INACTIVE_BORDER_COLOR},
            ]}>
            <Text
              style={[
                styles.traitGroupTitle,
                {color: COLORS.APP.BACKGROUND_COLOR},
              ]}>
              {traitName} ({traitErrors.length} plot
              {traitErrors.length > 1 ? 's' : ''})
            </Text>
          </View>

          <View style={styles.traitGroupContent}>
            {traitErrors.map(error => (
              <Pressable
                key={`${error.plotNumber}-${error.traitName}`}
                style={[
                  styles.traitErrorItem,
                  {borderColor: COLORS.COMPONENTS.TAB.BORDER_COLOR},
                ]}
                onPress={() =>
                  handlePlotTraitPress(error.plotNumber, error.traitName)
                }>
                <View style={styles.traitErrorHeader}>
                  <Text
                    style={[
                      styles.plotNumber,
                      {color: COLORS.APP.SECONDARY_COLOR},
                    ]}>
                    Plot {error.plotNumber}
                  </Text>
                  <Text
                    style={[
                      styles.errorValue,
                      {color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR},
                    ]}>
                    "{error.value}"
                  </Text>
                </View>

                <View style={styles.traitErrorDetails}>
                  {error.expectedRange &&
                    (error.expectedRange.minimum !== undefined ||
                      error.expectedRange.maximum !== undefined) && (
                      <Text
                        style={[
                          styles.rangeText,
                          {color: COLORS.COMPONENTS.TEXT.SECONDARY_COLOR},
                        ]}>
                        Expected: {error.expectedRange.minimum ?? '—'} -{' '}
                        {error.expectedRange.maximum ?? '—'}
                        {error.expectedRange.unit &&
                          ` ${error.expectedRange.unit}`}
                      </Text>
                    )}
                  {error.errorMessage && (
                    <Text style={[styles.errorMessage, {color: '#FF6B6B'}]}>
                      {error.errorMessage}
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderContent = () => {
    switch (displayMode) {
      case 'plots':
        return renderPlotGroupedView();
      case 'traits':
        return renderTraitGroupedView();
      default:
        return renderAllErrorsView();
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <View
        style={[styles.modal, {backgroundColor: COLORS.APP.BACKGROUND_COLOR}]}>
        <View
          style={[
            styles.header,
            {borderBottomColor: COLORS.COMPONENTS.TAB.BORDER_COLOR},
          ]}>
          <Text
            style={[
              styles.title,
              {color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR},
            ]}>
            {title}
          </Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text
              style={[styles.closeText, {color: COLORS.APP.SECONDARY_COLOR}]}>
              ✕
            </Text>
          </Pressable>
        </View>

        {renderSummaryCard()}
        {renderModeSelector()}

        <View style={styles.content}>{renderContent()}</View>

        <View
          style={[
            styles.footer,
            {borderTopColor: COLORS.COMPONENTS.TAB.BORDER_COLOR},
          ]}>
          {onRetryAll && (
            <Pressable
              onPress={onClose}
              style={[
                styles.retryButton,
                {backgroundColor: COLORS.APP.SECONDARY_COLOR},
              ]}>
              <Text
                style={[
                  styles.retryText,
                  {color: COLORS.APP.BACKGROUND_COLOR},
                ]}>
                Close
              </Text>
            </Pressable>
          )}

          {/* <Pressable
            style={[
              styles.cancelButton,
              {borderColor: COLORS.COMPONENTS.TAB.BORDER_COLOR},
            ]}
            onPress={onClose}>
            <Text
              style={[
                styles.cancelText,
                {color: COLORS.COMPONENTS.TEXT.PRIMARY_COLOR},
              ]}>
              Cancel
            </Text>
          </Pressable> */}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '90%',
    maxHeight: '85%',
    borderRadius: 12,
    elevation: 8,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryCard: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  summaryText: {
    fontSize: 12,
    lineHeight: 16,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  summaryValue: {
    fontSize: 12,
    flex: 1,
  },
  modeSelectorContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    minHeight: 200,
  },
  errorsList: {
    paddingHorizontal: 16,
  },
  errorItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  plotNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  traitName: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorDetails: {
    gap: 4,
  },
  errorValue: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  rangeText: {
    fontSize: 12,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  errorMessage: {
    fontSize: 12,
    fontWeight: '500',
  },
  plotGroup: {
    marginBottom: 12,
  },
  plotGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
  },
  plotGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 12,
  },
  plotGroupContent: {
    paddingLeft: 8,
    paddingTop: 8,
  },
  traitGroup: {
    marginBottom: 12,
  },
  traitGroupHeader: {
    padding: 12,
    borderRadius: 6,
  },
  traitGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  traitGroupContent: {
    paddingLeft: 8,
    paddingTop: 8,
  },
  traitErrorItem: {
    padding: 8,
    marginBottom: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  traitErrorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  traitErrorDetails: {
    gap: 2,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  retryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ValidationErrorModal;
