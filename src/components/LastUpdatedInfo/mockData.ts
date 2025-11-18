// Mock data for testing the LastUpdatedInfo component
// This can be used for development/testing until backend API provides the real data

export const mockUpdateData = {
  // Example for different traits
  'Plant Height': {
    updateDate: '15/04/2024',
    updateTime: '14:30',
    updateBy: 'Dr. Sharma',
    updateAt: 'Field Station A, Block 2',
  },
  'Germination Percentage': {
    updateDate: '14/04/2024',
    updateTime: '09:15',
    updateBy: 'Research Assistant Kumar',
    updateAt: 'Lab Building, Greenhouse 3',
  },
  'Final Plant Stand': {
    updateDate: '16/04/2024',
    updateTime: '11:45',
    updateBy: 'Dr. Patel',
    updateAt: 'Field Station B, Plot 205',
  },
  'Leaf Length': {
    updateDate: '13/04/2024',
    updateTime: '16:20',
    updateBy: 'Field Technician Singh',
    updateAt: 'Research Farm, Section C',
  },
};

// Helper function to get mock data for a trait
export const getMockUpdateData = (traitName: string) => {
  return mockUpdateData[traitName as keyof typeof mockUpdateData] || null;
};

// Function to get trait update data from API (no more mock data fallbacks)
export const getTraitUpdateData = (traitData: any, traitName: string) => {

  // Return null if no trait data is provided
  if (!traitData) {
    return null;
  }

  // Check if API data has the new field names: lastUpdatedAt, lat, long, locationName, updateBy, updateTime
  const hasApiUpdateData =
    traitData?.lastUpdatedAt ||
    traitData?.updateTime ||
    traitData?.updateBy ||
    traitData?.locationName ||
    traitData?.lat ||
    traitData?.long;

  if (hasApiUpdateData) {
    // Map API data to component expected format
    return {
      lastUpdatedAt: traitData.lastUpdatedAt,
      updateTime: traitData.updateTime,
      updateBy: traitData.updateBy,
      locationName: traitData.locationName,
      lat: traitData.lat,
      long: traitData.long,
    };
  }

  return null;
};
