// Static demo data for presentation mode

export const DEMO_OVERVIEW = {
  totalMembers: 127,
  activeMembers: 76,
  moderateMembers: 32,
  inactiveMembers: 19,
  totalCoaches: 6,
  activeCoaches: 5,
  mrr: 8943,
  revenueThisMonth: 12450,
  pendingPayments: 8,
  overduePayments: 3,
  overdueAmount: 267,
  todaySessionsCount: 8,
  totalSessions: 156,
  alerts: [
    {
      id: 'alert-1',
      title: '3 overdue payments',
      message: 'Members with pending payments require attention',
      severity: 'warning',
      created_at: new Date().toISOString(),
    },
    {
      id: 'alert-2',
      title: '12 inactive members',
      message: 'Members who haven\'t visited in 14+ days',
      severity: 'info',
      created_at: new Date().toISOString(),
    },
  ],
};

export const DEMO_GROWTH = {
  newMembersThisMonth: 18,
  newMembersLastMonth: 14,
  growthRate: 28.6,
};

export const DEMO_SESSIONS = [
  {
    id: 'session-1',
    title: 'Morning CrossFit',
    session_type: 'group',
    start_time: new Date(new Date().setHours(7, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
    status: 'completed',
    coach: { id: 'coach-1', name: 'Marco Bianchi' },
  },
  {
    id: 'session-2',
    title: 'Personal Training',
    session_type: 'personal',
    start_time: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    status: 'completed',
    coach: { id: 'coach-2', name: 'Sofia Meier' },
  },
  {
    id: 'session-3',
    title: 'HIIT Class',
    session_type: 'class',
    start_time: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(),
    status: 'scheduled',
    coach: { id: 'coach-3', name: 'Luca Schneider' },
  },
  {
    id: 'session-4',
    title: 'Yoga Flow',
    session_type: 'class',
    start_time: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
    status: 'scheduled',
    coach: { id: 'coach-4', name: 'Elena Weber' },
  },
  {
    id: 'session-5',
    title: 'Strength Training',
    session_type: 'group',
    start_time: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
    status: 'scheduled',
    coach: { id: 'coach-1', name: 'Marco Bianchi' },
  },
];

export const DEMO_MEMBERS = [
  { id: 'm1', gym_id: 'demo-gym-id', name: 'Luca Müller', email: 'luca.mueller@gmail.com', phone: '+41 79 123 4567', membership_type: 'premium', monthly_fee: 89, activity_status: 'active', total_visits: 45, last_visit: new Date().toISOString(), join_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), coach_id: 'c1', coach: { id: 'c1', name: 'Marco Bianchi' } },
  { id: 'm2', gym_id: 'demo-gym-id', name: 'Emma Schneider', email: 'emma.schneider@outlook.com', phone: '+41 78 234 5678', membership_type: 'vip', monthly_fee: 149, activity_status: 'active', total_visits: 62, last_visit: new Date().toISOString(), join_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), coach_id: 'c2', coach: { id: 'c2', name: 'Sofia Meier' } },
  { id: 'm3', gym_id: 'demo-gym-id', name: 'Noah Weber', email: 'noah.weber@bluewin.ch', phone: '+41 76 345 6789', membership_type: 'basic', monthly_fee: 49, activity_status: 'moderate', total_visits: 23, last_visit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), join_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), coach_id: null, coach: null },
  { id: 'm4', gym_id: 'demo-gym-id', name: 'Sofia Keller', email: 'sofia.keller@sunrise.ch', phone: '+41 77 456 7890', membership_type: 'premium', monthly_fee: 89, activity_status: 'active', total_visits: 38, last_visit: new Date().toISOString(), join_date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), coach_id: 'c4', coach: { id: 'c4', name: 'Elena Weber' } },
  { id: 'm5', gym_id: 'demo-gym-id', name: 'Matteo Fischer', email: 'matteo.fischer@protonmail.com', phone: '+41 79 567 8901', membership_type: 'trial', monthly_fee: 0, activity_status: 'active', total_visits: 3, last_visit: new Date().toISOString(), join_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), coach_id: null, coach: null },
  { id: 'm6', gym_id: 'demo-gym-id', name: 'Mia Huber', email: 'mia.huber@gmail.com', phone: '+41 79 678 9012', membership_type: 'premium', monthly_fee: 89, activity_status: 'active', total_visits: 52, last_visit: new Date().toISOString(), join_date: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(), coach_id: 'c3', coach: { id: 'c3', name: 'Luca Schneider' } },
  { id: 'm7', gym_id: 'demo-gym-id', name: 'Elias Brunner', email: 'elias.brunner@outlook.com', phone: '+41 78 789 0123', membership_type: 'basic', monthly_fee: 49, activity_status: 'inactive', total_visits: 8, last_visit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), join_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), coach_id: null, coach: null },
  { id: 'm8', gym_id: 'demo-gym-id', name: 'Laura Zimmermann', email: 'laura.zimmermann@bluewin.ch', phone: '+41 76 890 1234', membership_type: 'vip', monthly_fee: 149, activity_status: 'active', total_visits: 78, last_visit: new Date().toISOString(), join_date: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(), coach_id: 'c1', coach: { id: 'c1', name: 'Marco Bianchi' } },
  { id: 'm9', gym_id: 'demo-gym-id', name: 'David Steiner', email: 'david.steiner@sunrise.ch', phone: '+41 77 901 2345', membership_type: 'premium', monthly_fee: 89, activity_status: 'moderate', total_visits: 18, last_visit: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), join_date: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(), coach_id: 'c5', coach: { id: 'c5', name: 'Noah Keller' } },
  { id: 'm10', gym_id: 'demo-gym-id', name: 'Anna Gerber', email: 'anna.gerber@protonmail.com', phone: '+41 79 012 3456', membership_type: 'basic', monthly_fee: 49, activity_status: 'active', total_visits: 32, last_visit: new Date().toISOString(), join_date: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(), coach_id: null, coach: null },
];

export const DEMO_COACHES = [
  { id: 'c1', gym_id: 'demo-gym-id', name: 'Marco Bianchi', email: 'marco.bianchi@prometheus-gym.ch', phone: '+41 79 111 2233', specialization: 'CrossFit', is_active: true, client_count: 18, hourly_rate: 120, bio: 'Certified CrossFit Level 3 trainer with 8 years of experience.', avatar_url: null },
  { id: 'c2', gym_id: 'demo-gym-id', name: 'Sofia Meier', email: 'sofia.meier@prometheus-gym.ch', phone: '+41 78 222 3344', specialization: 'Personal Training', is_active: true, client_count: 24, hourly_rate: 100, bio: 'Specialized in body transformation and nutrition coaching.', avatar_url: null },
  { id: 'c3', gym_id: 'demo-gym-id', name: 'Luca Schneider', email: 'luca.schneider@prometheus-gym.ch', phone: '+41 76 333 4455', specialization: 'HIIT', is_active: true, client_count: 15, hourly_rate: 80, bio: 'High-intensity interval training specialist.', avatar_url: null },
  { id: 'c4', gym_id: 'demo-gym-id', name: 'Elena Weber', email: 'elena.weber@prometheus-gym.ch', phone: '+41 77 444 5566', specialization: 'Yoga', is_active: true, client_count: 22, hourly_rate: 100, bio: 'Certified Yoga Alliance RYT-500 instructor.', avatar_url: null },
  { id: 'c5', gym_id: 'demo-gym-id', name: 'Noah Keller', email: 'noah.keller@prometheus-gym.ch', phone: '+41 79 555 6677', specialization: 'Strength Training', is_active: true, client_count: 12, hourly_rate: 80, bio: 'Former competitive powerlifter, specializing in strength gains.', avatar_url: null },
  { id: 'c6', gym_id: 'demo-gym-id', name: 'Anna Fischer', email: 'anna.fischer@prometheus-gym.ch', phone: '+41 78 666 7788', specialization: 'Pilates', is_active: false, client_count: 8, hourly_rate: 100, bio: 'Pilates instructor on parental leave.', avatar_url: null },
];

export const DEMO_PAYMENTS = [
  { id: 'p1', gym_id: 'demo-gym-id', member_id: 'm1', amount: 89, status: 'paid', due_date: new Date().toISOString(), paid_date: new Date().toISOString(), payment_method: 'card', description: 'Monthly membership - January 2026', member: { id: 'm1', name: 'Luca Müller', email: 'luca.mueller@gmail.com' } },
  { id: 'p2', gym_id: 'demo-gym-id', member_id: 'm2', amount: 149, status: 'paid', due_date: new Date().toISOString(), paid_date: new Date().toISOString(), payment_method: 'bank_transfer', description: 'Monthly membership - January 2026', member: { id: 'm2', name: 'Emma Schneider', email: 'emma.schneider@outlook.com' } },
  { id: 'p3', gym_id: 'demo-gym-id', member_id: 'm3', amount: 49, status: 'pending', due_date: new Date().toISOString(), paid_date: null, payment_method: null, description: 'Monthly membership - January 2026', member: { id: 'm3', name: 'Noah Weber', email: 'noah.weber@bluewin.ch' } },
  { id: 'p4', gym_id: 'demo-gym-id', member_id: 'm4', amount: 89, status: 'overdue', due_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), paid_date: null, payment_method: null, description: 'Monthly membership - January 2026', member: { id: 'm4', name: 'Sofia Keller', email: 'sofia.keller@sunrise.ch' } },
  { id: 'p5', gym_id: 'demo-gym-id', member_id: 'm6', amount: 89, status: 'paid', due_date: new Date().toISOString(), paid_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), payment_method: 'card', description: 'Monthly membership - January 2026', member: { id: 'm6', name: 'Mia Huber', email: 'mia.huber@gmail.com' } },
  { id: 'p6', gym_id: 'demo-gym-id', member_id: 'm7', amount: 49, status: 'overdue', due_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), paid_date: null, payment_method: null, description: 'Monthly membership - January 2026', member: { id: 'm7', name: 'Elias Brunner', email: 'elias.brunner@outlook.com' } },
  { id: 'p7', gym_id: 'demo-gym-id', member_id: 'm8', amount: 149, status: 'paid', due_date: new Date().toISOString(), paid_date: new Date().toISOString(), payment_method: 'card', description: 'Monthly membership - January 2026', member: { id: 'm8', name: 'Laura Zimmermann', email: 'laura.zimmermann@bluewin.ch' } },
  { id: 'p8', gym_id: 'demo-gym-id', member_id: 'm9', amount: 89, status: 'pending', due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), paid_date: null, payment_method: null, description: 'Monthly membership - January 2026', member: { id: 'm9', name: 'David Steiner', email: 'david.steiner@sunrise.ch' } },
  { id: 'p9', gym_id: 'demo-gym-id', member_id: 'm10', amount: 49, status: 'paid', due_date: new Date().toISOString(), paid_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), payment_method: 'bank_transfer', description: 'Monthly membership - January 2026', member: { id: 'm10', name: 'Anna Gerber', email: 'anna.gerber@protonmail.com' } },
];

export const DEMO_MEMBER_STATS = {
  total: 127,
  active: 76,
  moderate: 32,
  inactive: 19,
  byMembership: {
    basic: 45,
    premium: 52,
    vip: 15,
    trial: 15,
  },
};

export const DEMO_COACH_STATS = {
  total: 6,
  active: 5,
  totalClients: 99,
  totalRevenue: 8500,
};

export const DEMO_PAYMENT_STATS = {
  revenueThisMonth: 12450,
  pendingAmount: 227,
  overdueAmount: 227,
  totalPaid: 45600,
};

// Analytics Demo Data
export const DEMO_OCCUPANCY_DATA = [
  { hour: '6:00', visits: 8 },
  { hour: '7:00', visits: 22 },
  { hour: '8:00', visits: 35 },
  { hour: '9:00', visits: 28 },
  { hour: '10:00', visits: 18 },
  { hour: '11:00', visits: 15 },
  { hour: '12:00', visits: 32 },
  { hour: '13:00', visits: 25 },
  { hour: '14:00', visits: 12 },
  { hour: '15:00', visits: 14 },
  { hour: '16:00', visits: 26 },
  { hour: '17:00', visits: 45 },
  { hour: '18:00', visits: 52 },
  { hour: '19:00', visits: 48 },
  { hour: '20:00', visits: 38 },
  { hour: '21:00', visits: 22 },
  { hour: '22:00', visits: 8 },
];

export const DEMO_REVENUE_BY_MONTH: Record<string, number> = (() => {
  const data: Record<string, number> = {};
  const now = new Date();

  // Generate 6 months of revenue data
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    // Realistic growing revenue pattern
    const baseRevenue = 9500;
    const growth = (5 - i) * 450; // Growing each month
    const variance = Math.floor(Math.random() * 800) - 400;
    data[key] = baseRevenue + growth + variance;
  }

  return data;
})();

// Retention data for analytics
export const DEMO_RETENTION_DATA = [
  { month: 'Aug', rate: 92 },
  { month: 'Sep', rate: 89 },
  { month: 'Oct', rate: 91 },
  { month: 'Nov', rate: 88 },
  { month: 'Dec', rate: 85 },
  { month: 'Jan', rate: 94 },
];

// Class attendance data
export const DEMO_CLASS_ATTENDANCE = [
  { name: 'CrossFit', attendance: 156, capacity: 180, rate: 87 },
  { name: 'Yoga', attendance: 132, capacity: 150, rate: 88 },
  { name: 'HIIT', attendance: 98, capacity: 120, rate: 82 },
  { name: 'Pilates', attendance: 72, capacity: 90, rate: 80 },
  { name: 'Boxing', attendance: 64, capacity: 80, rate: 80 },
  { name: 'Strength', attendance: 88, capacity: 100, rate: 88 },
];

// Top performing coaches
export const DEMO_COACH_PERFORMANCE = [
  { name: 'Marco Bianchi', sessions: 48, revenue: 5760, rating: 4.9 },
  { name: 'Sofia Meier', sessions: 52, revenue: 5200, rating: 4.8 },
  { name: 'Elena Weber', sessions: 44, revenue: 4400, rating: 4.9 },
  { name: 'Luca Schneider', sessions: 36, revenue: 2880, rating: 4.7 },
  { name: 'Noah Keller', sessions: 32, revenue: 2560, rating: 4.6 },
];

// Member acquisition channels
export const DEMO_ACQUISITION_CHANNELS = [
  { name: 'Referral', value: 42, color: 'hsl(23, 87%, 55%)' },
  { name: 'Website', value: 28, color: 'hsl(220, 70%, 50%)' },
  { name: 'Social Media', value: 18, color: 'hsl(142, 76%, 36%)' },
  { name: 'Walk-in', value: 12, color: 'hsl(38, 92%, 50%)' },
];

// Churn risk members
export const DEMO_CHURN_RISK = [
  { id: 'm7', name: 'Elias Brunner', lastVisit: '23 days ago', membership: 'Basic', risk: 'high' },
  { id: 'm11', name: 'Tim Gerber', lastVisit: '18 days ago', membership: 'Premium', risk: 'high' },
  { id: 'm12', name: 'Sandra Roth', lastVisit: '15 days ago', membership: 'Basic', risk: 'medium' },
  { id: 'm13', name: 'Patrick Wyss', lastVisit: '14 days ago', membership: 'Premium', risk: 'medium' },
];

// Monthly comparison stats
export const DEMO_MONTHLY_COMPARISON = {
  visits: { current: 2847, previous: 2654, change: 7.3 },
  newMembers: { current: 18, previous: 14, change: 28.6 },
  revenue: { current: 12450, previous: 11200, change: 11.2 },
  churnRate: { current: 2.1, previous: 3.4, change: -38.2 },
  avgVisitsPerMember: { current: 8.4, previous: 7.9, change: 6.3 },
  classAttendance: { current: 610, previous: 542, change: 12.5 },
};

// Member notes/reminders - for staff to see when member checks in
export interface MemberNote {
  id: string;
  member_id: string;
  note: string;
  priority: 'low' | 'medium' | 'high';
  category: 'health' | 'personal' | 'payment' | 'other';
  created_at: string;
  created_by: string;
  is_active: boolean;
}

export const DEMO_MEMBER_NOTES: MemberNote[] = [
  {
    id: 'note-1',
    member_id: 'm1',
    note: 'Knee surgery on Jan 10 - ask how recovery is going. Avoid heavy leg exercises for 6 weeks.',
    priority: 'high',
    category: 'health',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'Sofia Meier',
    is_active: true,
  },
  {
    id: 'note-2',
    member_id: 'm2',
    note: 'Birthday on February 3 - prepare small gift',
    priority: 'low',
    category: 'personal',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'Marco Bianchi',
    is_active: true,
  },
  {
    id: 'note-3',
    member_id: 'm3',
    note: 'Back pain issues - prefers modified exercises. Check if physiotherapy is helping.',
    priority: 'high',
    category: 'health',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'Elena Weber',
    is_active: true,
  },
  {
    id: 'note-4',
    member_id: 'm4',
    note: 'Interested in personal training sessions - follow up on pricing',
    priority: 'medium',
    category: 'other',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'Marco Bianchi',
    is_active: true,
  },
  {
    id: 'note-5',
    member_id: 'm6',
    note: 'Shoulder injury from last month - avoid overhead exercises',
    priority: 'high',
    category: 'health',
    created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'Luca Schneider',
    is_active: true,
  },
  {
    id: 'note-6',
    member_id: 'm8',
    note: 'VIP member - always greet by name, prefers morning slots',
    priority: 'medium',
    category: 'personal',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'Marco Bianchi',
    is_active: true,
  },
  {
    id: 'note-7',
    member_id: 'm9',
    note: 'Payment discussion pending - contact about outstanding balance',
    priority: 'medium',
    category: 'payment',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'Admin',
    is_active: true,
  },
];

// Check if we're in demo mode
export function isDemoMode(): boolean {
  try {
    return localStorage.getItem('prometheus_demo_mode') === 'true';
  } catch {
    return false;
  }
}

export function setDemoMode(enabled: boolean): void {
  try {
    if (enabled) {
      localStorage.setItem('prometheus_demo_mode', 'true');
    } else {
      localStorage.removeItem('prometheus_demo_mode');
    }
  } catch {
    // ignore
  }
}
