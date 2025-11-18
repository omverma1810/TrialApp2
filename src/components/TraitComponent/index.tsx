import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {DropdownArrow, FieldSybol1} from '../../assets/icons/svgs';
import {FONTS} from '../../theme/fonts';

const TraitComponent = ({
  projectData,
  selectedFields,
  fields,
  allPlotsData,
}: any) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  const getFieldLabel = (fieldId: string | number) => {
    // Safely lookup the field and return its fieldLabel for consistent display across screens.
    const f = Array.isArray(fields)
      ? fields.find((f: any) => String(f.id) === String(fieldId))
      : undefined;
    // Use nested location.fieldLabel where available to match other screens (Record, TakeNotes, etc.).
    return f?.location?.fieldLabel || 'Unknown';
  };

  // Guard against null or undefined data passed as props
  if (!projectData || !allPlotsData) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {projectData.map((trait: any, i: number) => (
        <View key={trait.traitName || i} style={styles.traitBlock}>
          <Pressable onPress={() => toggle(i)} style={styles.row}>
            <Text style={styles.title}>{trait.traitName}</Text>
            <TouchableOpacity onPress={() => toggle(i)}>
              <DropdownArrow />
            </TouchableOpacity>
          </Pressable>

          {openIndex === i && (
            <View style={styles.dropdown}>
              <ScrollView nestedScrollEnabled>
                {/* 1. We now map over allPlotsData as the primary source of truth. */}
                {allPlotsData
                  .filter((loc: any) => selectedFields[loc.trialLocationId])
                  .map((completeLocationData: any) => {
                    // 2. For the current trait, find the location data that matches.
                    // This might be undefined if no plots in this location have a value for this trait.
                    const traitLocation = trait.locationData.find(
                      (tl: any) =>
                        String(tl.trialLocationId) ===
                        String(completeLocationData.trialLocationId),
                    );

                    // Ensure we have a list of all plots to render for this location.
                    const allPlotsInLocation = Array.isArray(
                      completeLocationData.plotData,
                    )
                      ? completeLocationData.plotData
                      : Object.values(completeLocationData.plotData);

                    return (
                      <View
                        key={completeLocationData.trialLocationId}
                        style={styles.locationContainer}>
                        <View style={styles.header}>
                          <Text style={styles.headerText}>
                            {getFieldLabel(
                              completeLocationData.trialLocationId,
                            )}
                          </Text>
                          <FieldSybol1 />
                        </View>

                        {allPlotsInLocation.map((plot: any) => {
                          // 3. Perform a safe lookup for the value.
                          let value = null;
                          // Only try to find a value if traitLocation actually exists.
                          if (traitLocation && traitLocation.plotData) {
                            const traitValueData = Array.isArray(
                              traitLocation.plotData,
                            )
                              ? traitLocation.plotData.find(
                                  (traitPlot: any) =>
                                    String(traitPlot.plotNumber) ===
                                    String(plot.plotNumber),
                                )
                              : traitLocation.plotData[plot.plotNumber];

                            if (traitValueData) {
                              value = traitValueData.value;
                            }
                          }

                          return (
                            <View
                              key={plot.plotNumber}
                              style={styles.plotContainer}>
                              <Text style={styles.plotText}>
                                Plot {plot.plotNumber}
                              </Text>
                              <Text style={styles.plotValue}>
                                {value != null
                                  ? `${value} ${trait.traitUom || ''}`
                                  : 'N/A'}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    );
                  })}
              </ScrollView>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  traitBlock: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  title: {
    fontSize: 15,
    fontFamily: FONTS.MEDIUM,
    color: '#161616',
  },
  dropdown: {
    paddingVertical: 8,
  },
  locationContainer: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    padding: 10,
    borderRadius: 4,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#161616',
    marginRight: 8,
  },
  plotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginTop: 6,
  },
  plotText: {
    fontSize: 16,
    color: '#161616',
  },
  plotValue: {
    fontSize: 16,
  },
});

export default TraitComponent;
