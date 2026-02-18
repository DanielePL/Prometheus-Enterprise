// Static location analysis demo data for Zurich
// All data is deterministic (no Math.random()) and cross-referenced

// ============================================================
// TYPES
// ============================================================

export interface PLZData {
  plz: string;
  name: string;
  population: number;
  members: number;
  penetration: number;
  avgIncome: number;
  lat: number;
  lng: number;
  distanceKm: number;
  growthPotential: 'high' | 'medium' | 'low';
  monthlyRevenue: number;
}

export interface CompetitorData {
  id: string;
  name: string;
  address: string;
  postal_code: string;
  city: string;
  lat: number;
  lng: number;
  pricing_tier: 'budget' | 'mid' | 'premium' | 'luxury';
  monthly_price: number;
  estimated_members: number;
  notes: string;
}

export interface ExpansionScenarioData {
  id: string;
  name: string;
  address: string;
  postal_code: string;
  city: string;
  lat: number;
  lng: number;
  investment: number;
  monthly_rent: number;
  area_sqm: number;
  estimated_members: number;
  estimated_monthly_revenue: number;
  roi_months: number;
  cannibalization_pct: number;
  notes: string;
  status: 'evaluating' | 'draft';
}

export interface MarketOverview {
  totalMarketSize: number;
  currentMembers: number;
  marketPenetration: number;
  avgRevenuePerSqm: number;
  catchmentRadiusKm: number;
  gymAreaSqm: number;
  estimatedTotalGymMembers: number;
  gymMarketShare: number;
}

export interface SeasonalPattern {
  month: string;
  members: number;
  revenue: number;
}

export interface DistanceSegment {
  range: string;
  members: number;
  pct: number;
}

// ============================================================
// PLZ DATA (28 areas, total members = 127)
// ============================================================

export const DEMO_PLZ_DATA: PLZData[] = [
  // Inner city – highest member density
  { plz: '8001', name: 'Zürich City',         population: 5200,  members: 11, penetration: 0.0021, avgIncome: 72000,  lat: 47.3695, lng: 8.5390, distanceKm: 0.8,  growthPotential: 'medium', monthlyRevenue: 1045 },
  { plz: '8002', name: 'Zürich Enge',         population: 7800,  members: 8,  penetration: 0.0010, avgIncome: 98000,  lat: 47.3630, lng: 8.5310, distanceKm: 1.2,  growthPotential: 'high',   monthlyRevenue: 760  },
  { plz: '8003', name: 'Zürich Wiedikon',     population: 18500, members: 14, penetration: 0.0008, avgIncome: 68000,  lat: 47.3660, lng: 8.5220, distanceKm: 0.9,  growthPotential: 'high',   monthlyRevenue: 1330 },
  { plz: '8004', name: 'Zürich Aussersihl',   population: 14200, members: 22, penetration: 0.0015, avgIncome: 58000,  lat: 47.3770, lng: 8.5250, distanceKm: 0.0,  growthPotential: 'medium', monthlyRevenue: 2090 },
  { plz: '8005', name: 'Zürich Industriequartier', population: 12600, members: 15, penetration: 0.0012, avgIncome: 62000, lat: 47.3870, lng: 8.5200, distanceKm: 1.1, growthPotential: 'high', monthlyRevenue: 1425 },
  { plz: '8006', name: 'Zürich Oberstrass',   population: 11000, members: 9,  penetration: 0.0008, avgIncome: 82000,  lat: 47.3880, lng: 8.5430, distanceKm: 1.5,  growthPotential: 'high',   monthlyRevenue: 855  },
  { plz: '8007', name: 'Zürich Fluntern',     population: 8400,  members: 5,  penetration: 0.0006, avgIncome: 105000, lat: 47.3780, lng: 8.5570, distanceKm: 2.0,  growthPotential: 'medium', monthlyRevenue: 475  },
  { plz: '8008', name: 'Zürich Seefeld',      population: 10300, members: 7,  penetration: 0.0007, avgIncome: 112000, lat: 47.3560, lng: 8.5550, distanceKm: 2.5,  growthPotential: 'high',   monthlyRevenue: 665  },

  // Middle ring
  { plz: '8032', name: 'Zürich Hirslanden',   population: 9200,  members: 3,  penetration: 0.0003, avgIncome: 120000, lat: 47.3640, lng: 8.5680, distanceKm: 3.2,  growthPotential: 'medium', monthlyRevenue: 285  },
  { plz: '8037', name: 'Zürich Wipkingen',    population: 9800,  members: 5,  penetration: 0.0005, avgIncome: 65000,  lat: 47.3950, lng: 8.5260, distanceKm: 2.1,  growthPotential: 'medium', monthlyRevenue: 475  },
  { plz: '8038', name: 'Zürich Wollishofen',  population: 13400, members: 3,  penetration: 0.0002, avgIncome: 75000,  lat: 47.3410, lng: 8.5260, distanceKm: 4.0,  growthPotential: 'low',    monthlyRevenue: 285  },
  { plz: '8039', name: 'Zürich Sihlfeld',     population: 6100,  members: 2,  penetration: 0.0003, avgIncome: 60000,  lat: 47.3700, lng: 8.5100, distanceKm: 1.6,  growthPotential: 'medium', monthlyRevenue: 190  },
  { plz: '8040', name: 'Zürich Höngg',        population: 11500, members: 2,  penetration: 0.0002, avgIncome: 78000,  lat: 47.4020, lng: 8.4960, distanceKm: 4.2,  growthPotential: 'low',    monthlyRevenue: 190  },
  { plz: '8041', name: 'Zürich Leimbach',     population: 5600,  members: 1,  penetration: 0.0002, avgIncome: 64000,  lat: 47.3350, lng: 8.5200, distanceKm: 4.8,  growthPotential: 'low',    monthlyRevenue: 95   },
  { plz: '8042', name: 'Zürich Affoltern',    population: 8300,  members: 1,  penetration: 0.0001, avgIncome: 61000,  lat: 47.4180, lng: 8.5140, distanceKm: 5.2,  growthPotential: 'low',    monthlyRevenue: 95   },
  { plz: '8044', name: 'Zürich Gockhausen',   population: 3200,  members: 0,  penetration: 0.0000, avgIncome: 92000,  lat: 47.3930, lng: 8.5830, distanceKm: 5.8,  growthPotential: 'low',    monthlyRevenue: 0    },
  { plz: '8045', name: 'Zürich Friesenberg',  population: 7100,  members: 2,  penetration: 0.0003, avgIncome: 71000,  lat: 47.3590, lng: 8.5030, distanceKm: 3.0,  growthPotential: 'low',    monthlyRevenue: 190  },
  { plz: '8046', name: 'Zürich Affoltern Nord', population: 5800, members: 1, penetration: 0.0002, avgIncome: 59000, lat: 47.4230, lng: 8.5100, distanceKm: 5.6,  growthPotential: 'low',    monthlyRevenue: 95   },
  { plz: '8047', name: 'Zürich Albisrieden',  population: 9600,  members: 2,  penetration: 0.0002, avgIncome: 66000,  lat: 47.3760, lng: 8.4880, distanceKm: 3.5,  growthPotential: 'low',    monthlyRevenue: 190  },
  { plz: '8048', name: 'Zürich Altstetten',   population: 16200, members: 3,  penetration: 0.0002, avgIncome: 57000,  lat: 47.3880, lng: 8.4850, distanceKm: 3.8,  growthPotential: 'medium', monthlyRevenue: 285  },
  { plz: '8049', name: 'Zürich Höngg Süd',    population: 7500,  members: 1,  penetration: 0.0001, avgIncome: 74000,  lat: 47.4060, lng: 8.5050, distanceKm: 4.5,  growthPotential: 'low',    monthlyRevenue: 95   },
  { plz: '8050', name: 'Zürich Oerlikon',     population: 15800, members: 3,  penetration: 0.0002, avgIncome: 63000,  lat: 47.4110, lng: 8.5450, distanceKm: 4.1,  growthPotential: 'high',   monthlyRevenue: 285  },
  { plz: '8051', name: 'Zürich Schwamendingen', population: 12500, members: 2, penetration: 0.0002, avgIncome: 55000, lat: 47.4060, lng: 8.5670, distanceKm: 4.8,  growthPotential: 'medium', monthlyRevenue: 190  },
  { plz: '8057', name: 'Zürich Milchbuck',    population: 8900,  members: 3,  penetration: 0.0003, avgIncome: 67000,  lat: 47.3990, lng: 8.5430, distanceKm: 2.8,  growthPotential: 'medium', monthlyRevenue: 285  },

  // Outer / neighbouring municipalities
  { plz: '8600', name: 'Dübendorf',           population: 29000, members: 1,  penetration: 0.0000, avgIncome: 69000,  lat: 47.3970, lng: 8.6180, distanceKm: 7.8,  growthPotential: 'low',    monthlyRevenue: 95   },
  { plz: '8304', name: 'Wallisellen',         population: 17200, members: 0,  penetration: 0.0000, avgIncome: 73000,  lat: 47.4140, lng: 8.5970, distanceKm: 6.5,  growthPotential: 'low',    monthlyRevenue: 0    },
  { plz: '8952', name: 'Schlieren',            population: 19500, members: 1,  penetration: 0.0001, avgIncome: 56000,  lat: 47.3960, lng: 8.4480, distanceKm: 6.8,  growthPotential: 'low',    monthlyRevenue: 95   },
  { plz: '8134', name: 'Adliswil',            population: 19100, members: 0,  penetration: 0.0000, avgIncome: 80000,  lat: 47.3100, lng: 8.5250, distanceKm: 7.5,  growthPotential: 'low',    monthlyRevenue: 0    },
];

// ============================================================
// COMPETITORS (6)
// ============================================================

export const DEMO_COMPETITORS: CompetitorData[] = [
  {
    id: 'comp-1',
    name: 'Migros Fitness',
    address: 'Seidengasse 1',
    postal_code: '8001',
    city: 'Zürich',
    lat: 47.3730,
    lng: 8.5320,
    pricing_tier: 'budget',
    monthly_price: 49,
    estimated_members: 2500,
    notes: 'Large chain, high footfall location near Bahnhofstrasse. Basic equipment, no personal training.',
  },
  {
    id: 'comp-2',
    name: 'Holmes Place',
    address: 'Sihlstrasse 28',
    postal_code: '8001',
    city: 'Zürich',
    lat: 47.3720,
    lng: 8.5350,
    pricing_tier: 'luxury',
    monthly_price: 129,
    estimated_members: 800,
    notes: 'Premium club with pool, spa, and group classes. Targets high-income professionals.',
  },
  {
    id: 'comp-3',
    name: 'CrossFit Zürich',
    address: 'Geroldstrasse 31',
    postal_code: '8005',
    city: 'Zürich',
    lat: 47.3870,
    lng: 8.5180,
    pricing_tier: 'premium',
    monthly_price: 119,
    estimated_members: 350,
    notes: 'Dedicated CrossFit box in Kreis 5. Strong community, limited capacity per class.',
  },
  {
    id: 'comp-4',
    name: 'Kieser Training',
    address: 'Löwenstrasse 42',
    postal_code: '8001',
    city: 'Zürich',
    lat: 47.3760,
    lng: 8.5340,
    pricing_tier: 'premium',
    monthly_price: 99,
    estimated_members: 1200,
    notes: 'Medical-grade strength training. Older demographic, 2x/week model. High retention rates.',
  },
  {
    id: 'comp-5',
    name: 'update Fitness',
    address: 'Badenerstrasse 120',
    postal_code: '8004',
    city: 'Zürich',
    lat: 47.3780,
    lng: 8.5210,
    pricing_tier: 'budget',
    monthly_price: 39,
    estimated_members: 3000,
    notes: 'Largest budget chain in the area. 24/7 access, minimal staffing, no frills.',
  },
  {
    id: 'comp-6',
    name: 'Balboa Gym',
    address: 'Zweierstrasse 56',
    postal_code: '8004',
    city: 'Zürich',
    lat: 47.3740,
    lng: 8.5230,
    pricing_tier: 'mid',
    monthly_price: 79,
    estimated_members: 400,
    notes: 'Independent gym focusing on boxing and functional training. Loyal member base.',
  },
];

// ============================================================
// EXPANSION SCENARIOS (2)
// ============================================================

export const DEMO_EXPANSION_SCENARIOS: ExpansionScenarioData[] = [
  {
    id: 'exp-1',
    name: 'Oerlikon Nord',
    address: 'Thurgauerstrasse 40',
    postal_code: '8050',
    city: 'Zürich',
    lat: 47.4110,
    lng: 8.5450,
    investment: 450000,
    monthly_rent: 6800,
    area_sqm: 520,
    estimated_members: 180,
    estimated_monthly_revenue: 16200,
    roi_months: 28,
    cannibalization_pct: 12,
    notes: 'Fast-growing area with new residential developments. Good public transport links (S-Bahn Oerlikon). Moderate competition from budget chains.',
    status: 'evaluating',
  },
  {
    id: 'exp-2',
    name: 'Altstetten Zentrum',
    address: 'Altstetterstrasse 150',
    postal_code: '8048',
    city: 'Zürich',
    lat: 47.3880,
    lng: 8.4850,
    investment: 380000,
    monthly_rent: 5400,
    area_sqm: 440,
    estimated_members: 150,
    estimated_monthly_revenue: 13500,
    roi_months: 32,
    cannibalization_pct: 8,
    notes: 'Underserved area with growing population. Lower rents than central Zurich. Would capture members currently traveling to 8004.',
    status: 'draft',
  },
];

// ============================================================
// MARKET OVERVIEW
// ============================================================

export const DEMO_MARKET_OVERVIEW: MarketOverview = {
  totalMarketSize: 185000,
  currentMembers: 127,
  marketPenetration: 0.069,
  avgRevenuePerSqm: 18.4,
  catchmentRadiusKm: 5,
  gymAreaSqm: 680,
  estimatedTotalGymMembers: 28000,
  gymMarketShare: 0.45,
};

// ============================================================
// UTILIZATION HEATMAP (7 days × 17 hours: 6:00–22:00)
// Values: 0–100 representing occupancy %
// Rows: Mon(0)–Sun(6), Cols: hours 6–22
// ============================================================

export const DEMO_UTILIZATION_HEATMAP: number[][] = [
  // Mon: early-bird peak, lunch, strong evening
  [18, 28, 35, 30, 22, 38, 42, 35, 28, 22, 25, 55, 72, 78, 70, 52, 30],
  // Tue: similar to Mon but stronger evening peak
  [20, 30, 38, 32, 24, 40, 44, 36, 30, 24, 28, 60, 78, 85, 75, 55, 32],
  // Wed: slightly lower than Tue
  [16, 26, 32, 28, 20, 36, 40, 33, 26, 20, 24, 52, 68, 74, 66, 48, 28],
  // Thu: second-strongest evening (mirrors Tue)
  [19, 29, 36, 31, 23, 39, 43, 35, 29, 23, 27, 58, 76, 84, 73, 54, 31],
  // Fri: earlier drop-off in evening
  [17, 27, 34, 29, 21, 37, 41, 34, 27, 21, 26, 50, 62, 65, 55, 40, 22],
  // Sat: late start, midday peak, early close-off
  [ 5,  8, 15, 32, 48, 55, 58, 52, 44, 35, 28, 20, 15, 10,  6,  3,  2],
  // Sun: lowest day, midday only
  [ 3,  5, 10, 22, 35, 42, 45, 40, 32, 25, 18, 12,  8,  5,  3,  2,  1],
];

// ============================================================
// SEASONAL PATTERNS (12 months)
// January spike (New Year), summer dip (Jul–Aug), September recovery
// ============================================================

export const DEMO_SEASONAL_PATTERNS: SeasonalPattern[] = [
  { month: 'Jan', members: 138, revenue: 13110 },
  { month: 'Feb', members: 134, revenue: 12730 },
  { month: 'Mar', members: 131, revenue: 12445 },
  { month: 'Apr', members: 129, revenue: 12255 },
  { month: 'May', members: 127, revenue: 12065 },
  { month: 'Jun', members: 122, revenue: 11590 },
  { month: 'Jul', members: 112, revenue: 10640 },
  { month: 'Aug', members: 108, revenue: 10260 },
  { month: 'Sep', members: 120, revenue: 11400 },
  { month: 'Oct', members: 125, revenue: 11875 },
  { month: 'Nov', members: 127, revenue: 12065 },
  { month: 'Dec', members: 124, revenue: 11780 },
];

// ============================================================
// DISTANCE DISTRIBUTION (donut chart)
// ============================================================

export const DEMO_DISTANCE_DISTRIBUTION: DistanceSegment[] = [
  { range: '0-1 km',  members: 42, pct: 33 },
  { range: '1-3 km',  members: 48, pct: 38 },
  { range: '3-5 km',  members: 25, pct: 20 },
  { range: '5+ km',   members: 12, pct: 9  },
];
