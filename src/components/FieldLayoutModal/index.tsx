import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import type {RootState} from '../../store';
import {useAppSelector} from '../../store';
import Loader from '../Loader';
import {FONTS} from '../../theme/fonts';
import {getTokens, getVerifiedToken} from '../../utilities/token';

const {width: screenWidth} = Dimensions.get('window');

// Optimized styles with minimal spacing
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: screenWidth * 0.95,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 12,
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.MEDIUM,
    color: '#333',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontFamily: FONTS.MEDIUM,
    fontSize: 18,
    lineHeight: 20,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    color: 'red',
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 12,
    fontSize: 12,
    fontFamily: FONTS.REGULAR,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
    color: '#666',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataTitle: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
    color: '#999',
    textAlign: 'center',
  },
  fieldContainer: {
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#fff',
    borderRadius: 4,
    alignSelf: 'center',
  },
  replicationContainer: {
    marginBottom: 0,
  },
  replicationHeader: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  replicationTitle: {
    fontSize: 13,
    fontFamily: FONTS.MEDIUM,
    color: '#333',
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 17,
    fontFamily: FONTS.MEDIUM,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  gridContainer: {
    flexDirection: 'column',
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
  gridRow: {
    flexDirection: 'row',
  },
  plotCell: {
    borderWidth: 0.5,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
    minHeight: 52,
    minWidth: 65,
  },
  accessionText: {
    fontSize: 9,
    fontFamily: FONTS.MEDIUM,
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
    paddingHorizontal: 2,
  },
  plotNumberText: {
    fontSize: 11,
    fontFamily: FONTS.MEDIUM,
    color: '#000',
    textAlign: 'center',
    marginBottom: 2,
    paddingHorizontal: 2,
  },
  coordinatesText: {
    fontSize: 8,
    fontFamily: FONTS.REGULAR,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  layoutInfoContainer: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  layoutInfoText: {
    fontSize: 12,
    fontFamily: FONTS.MEDIUM,
    color: '#495057',
    textAlign: 'center',
  },
  replicationDivider: {
    backgroundColor: '#000',
    height: 4,
    width: '100%',
    marginVertical: 2,
  },
  replicationDividerVertical: {
    backgroundColor: '#000',
    width: 4,
    marginHorizontal: 2,
  },
});

interface FieldLayoutModalProps {
  isVisible: boolean;
  onClose: () => void;
  experimentID?: string;
  locationID?: string;
  type?: string;
  fieldLabel?: string;
  canViewAccessionId?: boolean;
  resolveAccessionId?: (plot: any) => string | number | null;
}

interface LocationDeploymentData {
  fieldbook?: Array<{
    fieldbook: any[][];
    repColor?: Record<string, string>;
  }>;
  layout?: 'horizontal' | 'vertical';
  startPosition?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
  noOfReplication?: number;
  startPlotNo?: number;
  designType?: string;
}

const FieldLayoutModal: React.FC<FieldLayoutModalProps> = ({
  isVisible,
  onClose,
  experimentID,
  locationID,
  type,
  fieldLabel,
  canViewAccessionId = false,
  resolveAccessionId,
}) => {
  const organizationURL = useAppSelector(
    (state: RootState) => state.auth.organizationURL,
  );
  const [locationDeploymentData, setLocationDeploymentData] =
    useState<LocationDeploymentData | null>(null);
  const [isLocationDeploymentLoading, setIsLocationDeploymentLoading] =
    useState<boolean>(false);
  const [locationDeploymentError, setLocationDeploymentError] = useState<
    string | null
  >(null);
  const [isMapModalLoading, setIsMapModalLoading] = useState<boolean>(false);

  const fetchLocationDeployment = async () => {
    if (!experimentID || !locationID) {
      return;
    }

    try {
      setIsLocationDeploymentLoading(true);
      setLocationDeploymentError(null);

      const tokens = await getTokens();
      const newTokens = await getVerifiedToken(tokens);

      if (!newTokens?.accessToken) {
        setLocationDeploymentError('Authentication required');
        return;
      }

      const normalizedBase = (() => {
        const base = (organizationURL || '').trim();
        if (!base) {
          return '';
        }
        return base.endsWith('/') ? base : base + '/';
      })();

      if (!normalizedBase) {
        setLocationDeploymentError('Organization URL not configured');
        return;
      }

      const fullApiUrl = `${normalizedBase}location-deployment/${experimentID}/?experimentType=${type}&landVillageId=${locationID}`;

      const response = await fetch(fullApiUrl, {
        method: 'GET',
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newTokens.accessToken}`,
        },
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (e) {}

      if (!response.ok) {
        const msg = `Location deployment fetch failed (HTTP ${response.status})`;
        setLocationDeploymentError(data?.message || data?.detail || msg);
        setLocationDeploymentData(null);
        return;
      }

      if (data) {
      }

      setLocationDeploymentData(data);
    } catch (error) {
      setLocationDeploymentError((error as any)?.message || 'Unknown error');
    } finally {
      setIsLocationDeploymentLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      setIsMapModalLoading(true);
      fetchLocationDeployment();
      setTimeout(() => {
        setIsMapModalLoading(false);
      }, 500);
    }
  }, [isVisible, experimentID, locationID, type]);

  const handleClose = () => {
    setIsMapModalLoading(false);
    onClose();
  };

  const getLayoutInfoText = (
    layout?: string,
    startPosition?: string,
    startPlotNo?: number,
    designType?: string,
  ): string => {
    const layoutType = layout || 'vertical';
    const capitalizedLayout =
      layoutType.charAt(0).toUpperCase() + layoutType.slice(1);

    if (designType?.toLowerCase() === 'breeding') {
      return `${capitalizedLayout} layout - Breeding design`;
    }

    const formatStartPosition = (pos?: string): string => {
      switch (pos) {
        case 'topRight':
          return 'top right';
        case 'topLeft':
          return 'top left';
        case 'bottomRight':
          return 'bottom right';
        case 'bottomLeft':
          return 'bottom left';
        default:
          return 'top left';
      }
    };

    const formattedPosition = formatStartPosition(startPosition);
    const startPlotText = startPlotNo
      ? ` (starting from plot ${startPlotNo})`
      : '';

    return `${capitalizedLayout} layout starting from ${formattedPosition}${startPlotText}`;
  };

  const extractPlotsFromFieldbook = (fieldbookSection: any): any[] => {
    if (!Array.isArray(fieldbookSection)) {
      return [];
    }

    const plots: any[] = [];
    fieldbookSection.forEach((entry: any) => {
      if (!entry) {
        return;
      }

      if (Array.isArray(entry)) {
        entry.forEach((item: any) => {
          if (item && typeof item === 'object') {
            plots.push(item);
          }
        });
      } else if (typeof entry === 'object') {
        plots.push(entry);
      }
    });

    return plots;
  };

  // Enhanced plotting logic that correctly handles startPosition and startPlotNo
  const createFieldGrid = (
    allPlots: any[],
    startPosition?: string,
    startPlotNo?: number,
  ): any[][] => {
    if (!allPlots || allPlots.length === 0) {
      return [];
    }

    // Create position maps
    const plotsByPosition: {[key: string]: any} = {};
    const plotsByNumber: {[key: number]: any} = {};
    const rows = new Set<number>();
    const cols = new Set<number>();

    allPlots.forEach((plot: any) => {
      if (plot && plot.ROW && plot.COLUMN && plot.PLOT) {
        const plotNumber =
          typeof plot.PLOT === 'string'
            ? parseInt(plot.PLOT.split('-').pop() || '0', 10)
            : parseInt(String(plot.PLOT), 10);

        const posKey = `${plot.ROW}-${plot.COLUMN}`;
        plotsByPosition[posKey] = plot;
        plotsByNumber[plotNumber] = plot;
        rows.add(plot.ROW);
        cols.add(plot.COLUMN);
      }
    });

    // Find starting plot
    let startingPlot: any = null;
    if (startPlotNo && plotsByNumber[startPlotNo]) {
      startingPlot = plotsByNumber[startPlotNo];
    }

    // Sort rows and columns based on startPosition
    let sortedRows = Array.from(rows).sort((a, b) => a - b);
    let sortedCols = Array.from(cols).sort((a, b) => a - b);

    // Apply startPosition logic
    switch (startPosition) {
      case 'topLeft':
        // Default: rows ascending, cols ascending
        break;
      case 'topRight':
        // Rows ascending, cols descending
        sortedCols = sortedCols.reverse();
        break;
      case 'bottomLeft':
        // Rows descending, cols ascending
        sortedRows = sortedRows.reverse();
        break;
      case 'bottomRight':
        // Both descending
        sortedRows = sortedRows.reverse();
        sortedCols = sortedCols.reverse();
        break;
    }

    // Build grid
    const grid: any[][] = [];
    sortedRows.forEach(rowNum => {
      const row: any[] = [];
      sortedCols.forEach(colNum => {
        const key = `${rowNum}-${colNum}`;
        const plot = plotsByPosition[key];
        if (plot) {
          row.push(plot);
        }
      });
      if (row.length > 0) {
        grid.push(row);
      }
    });

    return grid;
  };

  const createBreedingFieldGrid = (allPlots: any[]): any[][] => {
    if (!allPlots || allPlots.length === 0) {
      return [];
    }

    const plotsByPosition: {[key: string]: any} = {};
    const rows = new Set<number>();
    const cols = new Set<number>();

    allPlots.forEach((plot: any) => {
      if (plot && plot.ROW != null && plot.COLUMN != null) {
        const rowNumber = Number(plot.ROW);
        const colNumber = Number(plot.COLUMN);
        if (!Number.isNaN(rowNumber) && !Number.isNaN(colNumber)) {
          const posKey = `${rowNumber}-${colNumber}`;
          plotsByPosition[posKey] = plot;
          rows.add(rowNumber);
          cols.add(colNumber);
        }
      }
    });

    if (rows.size === 0 || cols.size === 0) {
      return [];
    }

    const sortedRows = Array.from(rows).sort((a, b) => a - b);
    const sortedCols = Array.from(cols).sort((a, b) => a - b);

    const grid: any[][] = [];
    sortedRows.forEach(rowNum => {
      const row: any[] = [];
      sortedCols.forEach(colNum => {
        const plot = plotsByPosition[`${rowNum}-${colNum}`];
        if (plot) {
          row.push(plot);
        }
      });
      if (row.length > 0) {
        grid.push(row);
      }
    });

    return grid;
  };

  // Function to determine replication order based on startPosition and startPlotNo
  const getReplicationOrder = (
    replicationGroups: {[key: string]: any[]},
    startPosition?: string,
    startPlotNo?: number,
  ): string[] => {
    const allReplications = Object.keys(replicationGroups).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

    // If we have startPlotNo, find which replication contains it
    let startingReplication: string | null = null;
    if (startPlotNo) {
      for (const [repKey, plots] of Object.entries(replicationGroups)) {
        const hasStartPlot = plots.some((plot: any) => {
          const plotNumber =
            typeof plot.PLOT === 'string'
              ? parseInt(plot.PLOT.split('-').pop() || '0', 10)
              : parseInt(String(plot.PLOT), 10);
          return plotNumber === startPlotNo;
        });
        if (hasStartPlot) {
          startingReplication = repKey;
          break;
        }
      }
    }

    // For vertical layout, if startPosition includes 'bottom', reverse replication order
    if (startPosition === 'bottomLeft' || startPosition === 'bottomRight') {
      const reversed = [...allReplications].reverse();
      return reversed;
    }

    return allReplications;
  };

  const calculateCellSize = (
    totalPlots: number,
    maxPlotNumberLength: number,
  ): number => {
    // Calculate cell size based on plot number length to ensure full visibility
    const baseWidth = Math.max(65, maxPlotNumberLength * 8 + 20);

    // Dynamic cell sizing based on number of plots
    if (totalPlots <= 12) return Math.max(baseWidth, 85);
    if (totalPlots <= 24) return Math.max(baseWidth, 75);
    if (totalPlots <= 50) return Math.max(baseWidth, 68);
    return Math.max(baseWidth, 65);
  };

  const renderPlotCell = (plot: any, cellSize: number, key: string) => {
    if (!plot) return null;

    // Calculate dynamic width based on plot number length
    const plotNumberStr = String(plot?.PLOT || '');
    const dynamicWidth = Math.max(cellSize, plotNumberStr.length * 8 + 20);
    const accessionValue = resolveAccessionId
      ? resolveAccessionId(plot)
      : plot?.ACCESSIONID;

    return (
      <View
        key={key}
        style={[
          styles.plotCell,
          {
            width: dynamicWidth,
            minHeight: 52,
            backgroundColor: plot?.COLOR || '#f0f0f0',
          },
        ]}>
        {canViewAccessionId && accessionValue ? (
          <Text
            style={styles.accessionText}
            numberOfLines={1}
            ellipsizeMode="tail">
            {accessionValue}
          </Text>
        ) : null}
        <Text
          style={styles.plotNumberText}
          numberOfLines={1}
          ellipsizeMode="middle">
          {plot?.PLOT || ''}
        </Text>
        <Text style={styles.coordinatesText} numberOfLines={1}>
          R{plot?.ROW} C{plot?.COLUMN}
        </Text>
      </View>
    );
  };

  const renderLayout = (rep: any) => {
    if (!rep?.fieldbook || !Array.isArray(rep.fieldbook)) {
      return null;
    }

    const isBreedingDesign =
      locationDeploymentData?.designType?.toLowerCase() === 'breeding';
    const isHorizontal = locationDeploymentData?.layout === 'horizontal';

    const startPosition = isBreedingDesign
      ? undefined
      : locationDeploymentData?.startPosition;
    const startPlotNo = isBreedingDesign
      ? undefined
      : locationDeploymentData?.startPlotNo;

    try {
      const allPlots = extractPlotsFromFieldbook(rep.fieldbook);
      if (allPlots.length === 0) {
        return null;
      }

      const replicationGroups: {[key: string]: any[]} = {};

      allPlots.forEach((plot: any) => {
        if (!plot) {
          return;
        }

        const repKey = isBreedingDesign
          ? plot?.REPLICATION || 'Field Layout'
          : plot?.REPLICATION;

        if (repKey) {
          if (!replicationGroups[repKey]) {
            replicationGroups[repKey] = [];
          }
          replicationGroups[repKey].push(plot);
        }
      });

      if (Object.keys(replicationGroups).length === 0) {
        replicationGroups['Field Layout'] = allPlots;
      }

      let orderedReplications: string[];
      if (isBreedingDesign) {
        orderedReplications = Object.keys(replicationGroups).sort((a, b) => {
          const numA = parseInt(a.replace(/\D/g, ''), 10);
          const numB = parseInt(b.replace(/\D/g, ''), 10);
          if (Number.isNaN(numA) || Number.isNaN(numB)) {
            return a.localeCompare(b);
          }
          return numA - numB;
        });
      } else {
        orderedReplications = getReplicationOrder(
          replicationGroups,
          startPosition,
          startPlotNo,
        );
      }

      const totalPlots = Object.values(replicationGroups).reduce(
        (sum, plots) => sum + plots.length,
        0,
      );

      const maxPlotNumberLength = Object.values(replicationGroups)
        .flat()
        .reduce((maxLen, plot) => {
          const plotStr = String(plot?.PLOT || '');
          return Math.max(maxLen, plotStr.length);
        }, 0);

      const cellSize = calculateCellSize(totalPlots, maxPlotNumberLength);

      const renderGridRows = (grid: any[][], repKey: string) =>
        grid.map((row: any[], rowIndex: number) => (
          <View key={`${repKey}-row-${rowIndex}`} style={styles.gridRow}>
            {row.map((plot: any, colIndex: number) =>
              renderPlotCell(
                plot,
                cellSize,
                `${repKey}-${rowIndex}-${colIndex}`,
              ),
            )}
          </View>
        ));

      if (isHorizontal) {
        return (
          <View style={styles.horizontalContainer}>
            {orderedReplications.map((repKey, repIndex) => {
              const plots = replicationGroups[repKey];
              if (!plots || plots.length === 0) {
                return null;
              }

              const grid = isBreedingDesign
                ? createBreedingFieldGrid(plots)
                : createFieldGrid(plots, startPosition, startPlotNo);

              const containerHeight = grid.length * cellSize;

              return (
                <React.Fragment key={repKey}>
                  {repIndex > 0 && (
                    <View
                      style={[
                        styles.replicationDividerVertical,
                        {height: containerHeight + 32},
                      ]}
                    />
                  )}
                  <View>
                    <View style={styles.replicationHeader}>
                      <Text style={styles.replicationTitle}>{repKey}</Text>
                    </View>
                    <View style={styles.gridContainer}>
                      {renderGridRows(grid, repKey)}
                    </View>
                  </View>
                </React.Fragment>
              );
            })}
          </View>
        );
      }

      return (
        <View style={styles.gridContainer}>
          {orderedReplications.map((repKey, repIndex) => {
            const plots = replicationGroups[repKey];
            if (!plots || plots.length === 0) {
              return null;
            }

            const grid = isBreedingDesign
              ? createBreedingFieldGrid(plots)
              : createFieldGrid(plots, startPosition, startPlotNo);

            return (
              <View key={repKey}>
                {repIndex > 0 && <View style={styles.replicationDivider} />}
                <View style={styles.replicationContainer}>
                  <View style={styles.replicationHeader}>
                    <Text style={styles.replicationTitle}>{repKey}</Text>
                  </View>
                  {renderGridRows(grid, repKey)}
                </View>
              </View>
            );
          })}
        </View>
      );
    } catch (error) {
      return null;
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}>
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Field Layout</Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            {locationDeploymentError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{locationDeploymentError}</Text>
                <Text style={styles.errorSubtext}>
                  Cannot load field layout. Pull to retry or check permissions.
                </Text>
              </View>
            ) : isMapModalLoading || isLocationDeploymentLoading ? (
              <View style={styles.loadingContainer}>
                <Loader />
                <Text style={styles.loadingText}>
                  {isMapModalLoading
                    ? 'Loading map view...'
                    : 'Loading field layout...'}
                </Text>
              </View>
            ) : locationDeploymentData?.fieldbook ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                style={{flex: 1}}
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    paddingVertical: 12,
                  }}>
                  {fieldLabel && (
                    <Text style={styles.fieldLabel}>{fieldLabel}</Text>
                  )}

                  <View style={styles.fieldContainer}>
                    {locationDeploymentData.fieldbook.map(
                      (rep: any, repIndex: number) => (
                        <View key={`fieldbook-${repIndex}`}>
                          {renderLayout(rep)}
                        </View>
                      ),
                    )}
                  </View>

                  <View style={styles.layoutInfoContainer}>
                    <Text style={styles.layoutInfoText}>
                      {getLayoutInfoText(
                        locationDeploymentData?.layout,
                        locationDeploymentData?.startPosition,
                        locationDeploymentData?.startPlotNo,
                        locationDeploymentData?.designType,
                      )}
                    </Text>
                  </View>
                </ScrollView>
              </ScrollView>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataTitle}>
                  No field layout data available
                </Text>
                <Text style={styles.noDataSubtext}>
                  The field layout information could not be loaded
                </Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default FieldLayoutModal;
