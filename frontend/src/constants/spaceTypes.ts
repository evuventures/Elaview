// frontend/src/constants/spaceTypes.ts

interface CityData {
  state: string;
  neighborhoods: string[];
}

interface BetaCities {
  [key: string]: CityData;
}

interface CategorizedSpaceType {
  category: string;
  types: string[];
}

export const adSpaceCategories: { [key: string]: string[] } = {
  'Outdoor Static': [
    'Billboard', 'Building Wall', 'Construction Fence', 
    'Bus Shelter', 'Rooftop', 'Street Furniture'
  ],
  'Digital Displays': [
    'LED Billboard', 'Digital Kiosk', 'Interactive Display', 
    'Video Wall', 'Smart City Display'
  ],
  'Transportation': [
    'Vehicle Wrap', 'Transit Station', 'Airport Display', 
    'Taxi/Rideshare', 'Parking Structure'
  ],
  'Retail/Commercial': [
    'Storefront Window', 'Point-of-Sale Display', 'Shopping Mall Kiosk', 
    'Elevator Panel', 'Restroom Display'
  ],
  'Events/Venues': [
    'Stadium/Arena', 'Concert Venue', 'Trade Show Space', 
    'Pop-up Location', 'Festival Ground'
  ],
  'Guerrilla/Creative': [
    'Street Art Wall', 'Projection Surface', 'Sidewalk Graphics', 
    'Bridge Display', 'Water Tower'
  ],
  'Specialty': [
    'Gas Station Display', 'ATM Screen', 'Phone Booth', 
    'Charging Station', 'Bike Rack Display'
  ]
};

// Flatten for dropdowns with organized structure
export const flatSpaceTypes: string[] = Object.values(adSpaceCategories).flat();

// For dropdowns with categories
export const categorizedSpaceTypes: CategorizedSpaceType[] = Object.entries(adSpaceCategories).map(([category, types]) => ({
  category,
  types
}));

// Beta cities location data
export const betaCities: BetaCities = {
  'Sioux Falls': {
    state: 'SD',
    neighborhoods: [
      'Downtown Core',
      'Medical District', 
      'Falls Park Area',
      'Western Mall District',
      'Tea/Ellis Area'
    ]
  },
  'Oklahoma City': {
    state: 'OK', 
    neighborhoods: [
      'Bricktown',
      'Energy Corridor',
      'Midtown',
      'Plaza District',
      'Automobile Alley'
    ]
  },
  'Alameda': {
    state: 'CA',
    neighborhoods: [
      'Park Street District',
      'Tech Hub',
      'West End',
      'East Shore',
      'Marina Village'
    ]
  }
};

// Traffic estimates for all markets
export const trafficEstimates: string[] = [
  'Under 1,000 daily',
  '1,000 - 5,000 daily', 
  '5,000 - 10,000 daily',
  '10,000 - 15,000 daily',
  '15,000 - 20,000 daily',
  '20,000+ daily'
];

// Visibility options
export const visibilityOptions: string[] = [
  'High - Street Level',
  'Medium - Elevated', 
  'Low - Partially Obstructed',
  'Variable - Depends on Time'
];

// Enhanced features list
export const availableFeatures: string[] = [
  'High visibility from main street',
  'Unobstructed view from multiple angles',
  'Professional installation available',
  'Illuminated at night',
  'Weather-resistant surface',
  'Traffic analytics provided monthly',
  'Digital display compatible',
  'Easy access for installation',
  'Parking available nearby',
  'Security monitoring',
  'Climate controlled access',
  'Premium location',
  'High foot traffic area',
  'Business district location',
  'Public transportation nearby',
  'Event venue proximity',
  'Tourist attraction nearby',
  'Shopping center visibility'
]; 