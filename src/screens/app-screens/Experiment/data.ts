const crops = [
  {
    id: 0,
    title: 'All',
    isSelected: true,
  },
  {
    id: 1,
    title: 'Maize',
    isSelected: false,
  },
  {
    id: 2,
    title: 'Rice',
    isSelected: false,
  },
];

const projects = [
  {
    id: 0,
    title: 'Project 1',
    isSelected: true,
  },
  {
    id: 1,
    title: 'Project 2',
    isSelected: false,
  },
  {
    id: 2,
    title: 'Project 3',
    isSelected: false,
  },
  {
    id: 3,
    title: 'Project 4',
    isSelected: false,
  },
  {
    id: 4,
    title: 'Project 5',
    isSelected: false,
  },
];

const experiments = [
  {
    crop_id: 0,
    crop_name: 'Maize',
    experiments: [
      {
        id: 'TM-RC-24-01-01.1',
        name: 'GE-Male Line (R) development',
        total_entries: '118',
        entries_count: '32',
        field_design: 'RCBD',
        season: 'Rainy',
        plots_count: '30',
        replication_count: '3',
        randomization: 'Yes',
        location_count: '2',
        field_count: '3',
        total_traits: '80',
      },
      {
        id: 'TM-RC-24-01-01.3',
        name: 'GE-Male Line (R) development',
        total_entries: '118',
        entries_count: '32',
        field_design: 'RCBD',
        season: 'Rainy',
        plots_count: '30',
        replication_count: '3',
        randomization: 'Yes',
        location_count: '2',
        field_count: '3',
        total_traits: '80',
      },
    ],
  },
  {
    crop_id: 1,
    crop_name: 'Rice',
    experiments: [
      {
        id: 'TM-RC-24-01-01.2',
        name: 'GE-Male Line (R) development',
        total_entries: '118',
        entries_count: '32',
        field_design: 'RCBD',
        season: 'Rainy',
        plots_count: '30',
        replication_count: '3',
        randomization: 'Yes',
        location_count: '2',
        field_count: '3',
        total_traits: '80',
      },
    ],
  },
];

export {crops, projects, experiments};
