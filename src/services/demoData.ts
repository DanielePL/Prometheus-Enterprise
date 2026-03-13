// Static demo data for presentation mode
// All data is deterministic (no Math.random()) and cross-referenced

import type { AccessMethod, AccessStatus } from '@/types/database';
import type { CoachSummary, CoachClient, CoachWorkout, CoachProgram } from '@/types/coachIntegration';
import type { CoachResponseMetrics, CoachServiceIndex, CoachActivityEvent } from '@/types/coachDetail';

// ============================================================
// HELPERS
// ============================================================

/** Returns dynamic month labels going back N months from today */
function getRecentMonths(count: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleString('en-US', { month: 'short' }));
  }
  return months;
}

/** Returns a YYYY-MM key for N months ago */
function monthKey(monthsAgo: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Returns ISO date string for N days ago */
function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

/** Returns ISO date string for N hours ago today */
function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 60 * 60 * 1000).toISOString();
}

/** Returns today at a specific hour */
function todayAt(hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

// ============================================================
// CHECK DEMO MODE
// ============================================================

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

// ============================================================
// COACHES (6 coaches — fixed to match database.ts types)
// ============================================================

export const DEMO_COACHES = [
  { id: 'c1', gym_id: 'demo-gym-id', profile_id: null, name: 'Marco Bianchi', email: 'marco.bianchi@prometheus-gym.ch', phone: '+41 79 111 2233', specializations: ['CrossFit', 'Strength Training'], is_active: true, client_count: 18, hourly_rate: 120, bio: 'Certified CrossFit Level 3 trainer with 8 years of experience.', avatar_url: null, rating: 4.9, sessions_this_month: 48, revenue_this_month: 5760, created_at: daysAgo(400), updated_at: daysAgo(1) },
  { id: 'c2', gym_id: 'demo-gym-id', profile_id: null, name: 'Sofia Meier', email: 'sofia.meier@prometheus-gym.ch', phone: '+41 78 222 3344', specializations: ['Personal Training', 'Nutrition'], is_active: true, client_count: 24, hourly_rate: 100, bio: 'Specialized in body transformation and nutrition coaching.', avatar_url: null, rating: 4.8, sessions_this_month: 52, revenue_this_month: 5200, created_at: daysAgo(380), updated_at: daysAgo(1) },
  { id: 'c3', gym_id: 'demo-gym-id', profile_id: null, name: 'Luca Schneider', email: 'luca.schneider@prometheus-gym.ch', phone: '+41 76 333 4455', specializations: ['HIIT', 'Functional Training'], is_active: true, client_count: 15, hourly_rate: 80, bio: 'High-intensity interval training specialist.', avatar_url: null, rating: 4.7, sessions_this_month: 36, revenue_this_month: 2880, created_at: daysAgo(350), updated_at: daysAgo(2) },
  { id: 'c4', gym_id: 'demo-gym-id', profile_id: null, name: 'Elena Weber', email: 'elena.weber@prometheus-gym.ch', phone: '+41 77 444 5566', specializations: ['Yoga', 'Pilates', 'Mobility'], is_active: true, client_count: 22, hourly_rate: 100, bio: 'Certified Yoga Alliance RYT-500 instructor.', avatar_url: null, rating: 4.9, sessions_this_month: 44, revenue_this_month: 4400, created_at: daysAgo(320), updated_at: daysAgo(1) },
  { id: 'c5', gym_id: 'demo-gym-id', profile_id: null, name: 'Noah Keller', email: 'noah.keller@prometheus-gym.ch', phone: '+41 79 555 6677', specializations: ['Strength Training', 'Powerlifting'], is_active: true, client_count: 12, hourly_rate: 80, bio: 'Former competitive powerlifter, specializing in strength gains.', avatar_url: null, rating: 4.6, sessions_this_month: 32, revenue_this_month: 2560, created_at: daysAgo(280), updated_at: daysAgo(3) },
  { id: 'c6', gym_id: 'demo-gym-id', profile_id: null, name: 'Anna Fischer', email: 'anna.fischer@prometheus-gym.ch', phone: '+41 78 666 7788', specializations: ['Pilates', 'Rehabilitation'], is_active: false, client_count: 8, hourly_rate: 100, bio: 'Pilates instructor on parental leave.', avatar_url: null, rating: 4.5, sessions_this_month: 0, revenue_this_month: 0, created_at: daysAgo(400), updated_at: daysAgo(60) },
  { id: 'c7', gym_id: 'demo-gym-id', profile_id: null, name: 'Daniele Pauli', email: 'danielepauli@gmail.com', phone: '+41 79 777 8899', specializations: ['Strength Training', 'Functional Training', 'Nutrition'], is_active: true, client_count: 14, hourly_rate: 110, bio: 'Founder & Head Coach. Certified strength and conditioning specialist with a passion for functional fitness and holistic athlete development.', avatar_url: null, rating: 4.9, sessions_this_month: 42, revenue_this_month: 4620, created_at: daysAgo(500), updated_at: daysAgo(0) },
];

// ============================================================
// MEMBERS (30 browsable members)
// ============================================================

export const DEMO_MEMBERS = [
  // 4 VIP (CHF 149)
  { id: 'm1', gym_id: 'demo-gym-id', name: 'Emma Schneider', email: 'emma.schneider@outlook.com', phone: '+41 78 234 5678', membership_type: 'vip', monthly_fee: 149, activity_status: 'active', total_visits: 62, last_visit: daysAgo(0), join_date: daysAgo(365), postal_code: '8001', city: 'Zürich', coach_id: 'c2', coach: { id: 'c2', name: 'Sofia Meier' } },
  { id: 'm2', gym_id: 'demo-gym-id', name: 'Laura Zimmermann', email: 'laura.zimmermann@bluewin.ch', phone: '+41 76 890 1234', membership_type: 'vip', monthly_fee: 149, activity_status: 'active', total_visits: 78, last_visit: daysAgo(0), join_date: daysAgo(400), postal_code: '8002', city: 'Zürich', coach_id: 'c1', coach: { id: 'c1', name: 'Marco Bianchi' } },
  { id: 'm3', gym_id: 'demo-gym-id', name: 'Thomas Brunner', email: 'thomas.brunner@gmail.com', phone: '+41 79 345 6789', membership_type: 'vip', monthly_fee: 149, activity_status: 'active', total_visits: 95, last_visit: daysAgo(1), join_date: daysAgo(500), postal_code: '8008', city: 'Zürich', coach_id: 'c1', coach: { id: 'c1', name: 'Marco Bianchi' } },
  { id: 'm4', gym_id: 'demo-gym-id', name: 'Nina Hartmann', email: 'nina.hartmann@sunrise.ch', phone: '+41 77 456 2345', membership_type: 'vip', monthly_fee: 149, activity_status: 'moderate', total_visits: 41, last_visit: daysAgo(5), join_date: daysAgo(200), postal_code: '8003', city: 'Zürich', coach_id: 'c4', coach: { id: 'c4', name: 'Elena Weber' } },

  // 12 Premium (CHF 89)
  { id: 'm5', gym_id: 'demo-gym-id', name: 'Luca Müller', email: 'luca.mueller@gmail.com', phone: '+41 79 123 4567', membership_type: 'premium', monthly_fee: 89, activity_status: 'active', total_visits: 45, last_visit: daysAgo(0), join_date: daysAgo(180), postal_code: '8004', city: 'Zürich', coach_id: 'c1', coach: { id: 'c1', name: 'Marco Bianchi' } },
  { id: 'm6', gym_id: 'demo-gym-id', name: 'Sofia Keller', email: 'sofia.keller@sunrise.ch', phone: '+41 77 456 7890', membership_type: 'premium', monthly_fee: 89, activity_status: 'active', total_visits: 38, last_visit: daysAgo(0), join_date: daysAgo(120), postal_code: '8005', city: 'Zürich', coach_id: 'c4', coach: { id: 'c4', name: 'Elena Weber' } },
  { id: 'm7', gym_id: 'demo-gym-id', name: 'Mia Huber', email: 'mia.huber@gmail.com', phone: '+41 79 678 9012', membership_type: 'premium', monthly_fee: 89, activity_status: 'active', total_visits: 52, last_visit: daysAgo(1), join_date: daysAgo(200), postal_code: '8006', city: 'Zürich', coach_id: 'c3', coach: { id: 'c3', name: 'Luca Schneider' } },
  { id: 'm8', gym_id: 'demo-gym-id', name: 'David Steiner', email: 'david.steiner@sunrise.ch', phone: '+41 77 901 2345', membership_type: 'premium', monthly_fee: 89, activity_status: 'moderate', total_visits: 18, last_visit: daysAgo(10), join_date: daysAgo(75), postal_code: '8037', city: 'Zürich', coach_id: 'c5', coach: { id: 'c5', name: 'Noah Keller' } },
  { id: 'm9', gym_id: 'demo-gym-id', name: 'Lea Bachmann', email: 'lea.bachmann@protonmail.com', phone: '+41 78 112 3344', membership_type: 'premium', monthly_fee: 89, activity_status: 'active', total_visits: 33, last_visit: daysAgo(0), join_date: daysAgo(150), postal_code: '8032', city: 'Zürich', coach_id: 'c2', coach: { id: 'c2', name: 'Sofia Meier' } },
  { id: 'm10', gym_id: 'demo-gym-id', name: 'Fabian Roth', email: 'fabian.roth@bluewin.ch', phone: '+41 76 223 4455', membership_type: 'premium', monthly_fee: 89, activity_status: 'active', total_visits: 29, last_visit: daysAgo(2), join_date: daysAgo(110), postal_code: '8048', city: 'Zürich', coach_id: null, coach: null },
  { id: 'm11', gym_id: 'demo-gym-id', name: 'Tim Gerber', email: 'tim.gerber@gmail.com', phone: '+41 79 334 5566', membership_type: 'premium', monthly_fee: 89, activity_status: 'moderate', total_visits: 15, last_visit: daysAgo(18), join_date: daysAgo(90), postal_code: '8050', city: 'Zürich', coach_id: null, coach: null },
  { id: 'm12', gym_id: 'demo-gym-id', name: 'Sandra Roth', email: 'sandra.roth@outlook.com', phone: '+41 78 445 6677', membership_type: 'premium', monthly_fee: 89, activity_status: 'moderate', total_visits: 12, last_visit: daysAgo(15), join_date: daysAgo(80), postal_code: '8051', city: 'Zürich', coach_id: null, coach: null },
  { id: 'm13', gym_id: 'demo-gym-id', name: 'Patrick Wyss', email: 'patrick.wyss@sunrise.ch', phone: '+41 77 556 7788', membership_type: 'premium', monthly_fee: 89, activity_status: 'moderate', total_visits: 14, last_visit: daysAgo(14), join_date: daysAgo(85), postal_code: '8057', city: 'Zürich', coach_id: 'c5', coach: { id: 'c5', name: 'Noah Keller' } },
  { id: 'm14', gym_id: 'demo-gym-id', name: 'Julia Frei', email: 'julia.frei@protonmail.com', phone: '+41 79 667 8899', membership_type: 'premium', monthly_fee: 89, activity_status: 'active', total_visits: 40, last_visit: daysAgo(1), join_date: daysAgo(170), postal_code: '8038', city: 'Zürich', coach_id: 'c4', coach: { id: 'c4', name: 'Elena Weber' } },
  { id: 'm15', gym_id: 'demo-gym-id', name: 'Marco Widmer', email: 'marco.widmer@bluewin.ch', phone: '+41 76 778 9900', membership_type: 'premium', monthly_fee: 89, activity_status: 'active', total_visits: 27, last_visit: daysAgo(3), join_date: daysAgo(130), postal_code: '8045', city: 'Zürich', coach_id: null, coach: null },
  { id: 'm16', gym_id: 'demo-gym-id', name: 'Céline Meier', email: 'celine.meier@gmail.com', phone: '+41 78 889 0011', membership_type: 'premium', monthly_fee: 89, activity_status: 'active', total_visits: 36, last_visit: daysAgo(0), join_date: daysAgo(160), postal_code: '8047', city: 'Zürich', coach_id: 'c2', coach: { id: 'c2', name: 'Sofia Meier' } },

  // 10 Basic (CHF 49)
  { id: 'm17', gym_id: 'demo-gym-id', name: 'Noah Weber', email: 'noah.weber@bluewin.ch', phone: '+41 76 345 6789', membership_type: 'basic', monthly_fee: 49, activity_status: 'moderate', total_visits: 23, last_visit: daysAgo(7), join_date: daysAgo(90), postal_code: '8040', city: 'Zürich', coach_id: null, coach: null },
  { id: 'm18', gym_id: 'demo-gym-id', name: 'Elias Brunner', email: 'elias.brunner@outlook.com', phone: '+41 78 789 0123', membership_type: 'basic', monthly_fee: 49, activity_status: 'inactive', total_visits: 8, last_visit: daysAgo(30), join_date: daysAgo(60), postal_code: '8049', city: 'Zürich', coach_id: null, coach: null },
  { id: 'm19', gym_id: 'demo-gym-id', name: 'Anna Gerber', email: 'anna.gerber@protonmail.com', phone: '+41 79 012 3456', membership_type: 'basic', monthly_fee: 49, activity_status: 'active', total_visits: 32, last_visit: daysAgo(1), join_date: daysAgo(150), postal_code: '8046', city: 'Zürich', coach_id: null, coach: null },
  { id: 'm20', gym_id: 'demo-gym-id', name: 'Simon Kessler', email: 'simon.kessler@gmail.com', phone: '+41 79 901 1122', membership_type: 'basic', monthly_fee: 49, activity_status: 'active', total_visits: 19, last_visit: daysAgo(2), join_date: daysAgo(100), postal_code: '8052', city: 'Zürich', coach_id: null, coach: null },
  { id: 'm21', gym_id: 'demo-gym-id', name: 'Melanie Suter', email: 'melanie.suter@outlook.com', phone: '+41 78 012 2233', membership_type: 'basic', monthly_fee: 49, activity_status: 'inactive', total_visits: 5, last_visit: daysAgo(35), join_date: daysAgo(50), postal_code: '8053', city: 'Zürich', coach_id: null, coach: null },
  { id: 'm22', gym_id: 'demo-gym-id', name: 'Jan Wenger', email: 'jan.wenger@bluewin.ch', phone: '+41 76 123 3344', membership_type: 'basic', monthly_fee: 49, activity_status: 'moderate', total_visits: 11, last_visit: daysAgo(12), join_date: daysAgo(70), postal_code: '8055', city: 'Zürich', coach_id: null, coach: null },
  { id: 'm23', gym_id: 'demo-gym-id', name: 'Lisa Zürcher', email: 'lisa.zuercher@sunrise.ch', phone: '+41 77 234 4455', membership_type: 'basic', monthly_fee: 49, activity_status: 'active', total_visits: 22, last_visit: daysAgo(3), join_date: daysAgo(120), postal_code: '8041', city: 'Zürich', coach_id: null, coach: null },
  { id: 'm24', gym_id: 'demo-gym-id', name: 'Dominik Hofmann', email: 'dominik.hofmann@protonmail.com', phone: '+41 79 345 5566', membership_type: 'basic', monthly_fee: 49, activity_status: 'inactive', total_visits: 6, last_visit: daysAgo(28), join_date: daysAgo(55), postal_code: '8044', city: 'Zürich', coach_id: null, coach: null },
  { id: 'm25', gym_id: 'demo-gym-id', name: 'Sabrina Egger', email: 'sabrina.egger@gmail.com', phone: '+41 78 456 6677', membership_type: 'basic', monthly_fee: 49, activity_status: 'moderate', total_visits: 16, last_visit: daysAgo(9), join_date: daysAgo(95), postal_code: '8042', city: 'Zürich', coach_id: null, coach: null },
  { id: 'm26', gym_id: 'demo-gym-id', name: 'Raphael Ammann', email: 'raphael.ammann@bluewin.ch', phone: '+41 76 567 7788', membership_type: 'basic', monthly_fee: 49, activity_status: 'active', total_visits: 25, last_visit: daysAgo(1), join_date: daysAgo(140), postal_code: '8043', city: 'Zürich', coach_id: null, coach: null },

  // 4 Trial (CHF 0)
  { id: 'm27', gym_id: 'demo-gym-id', name: 'Matteo Fischer', email: 'matteo.fischer@protonmail.com', phone: '+41 79 567 8901', membership_type: 'trial', monthly_fee: 0, activity_status: 'active', total_visits: 3, last_visit: daysAgo(0), join_date: daysAgo(5), postal_code: '8001', city: 'Zürich', coach_id: null, coach: null },
  { id: 'm28', gym_id: 'demo-gym-id', name: 'Vanessa Bühler', email: 'vanessa.buehler@gmail.com', phone: '+41 78 678 9012', membership_type: 'trial', monthly_fee: 0, activity_status: 'active', total_visits: 2, last_visit: daysAgo(1), join_date: daysAgo(3), postal_code: '8005', city: 'Zürich', coach_id: null, coach: null },
  { id: 'm29', gym_id: 'demo-gym-id', name: 'Nico Berger', email: 'nico.berger@outlook.com', phone: '+41 76 789 0123', membership_type: 'trial', monthly_fee: 0, activity_status: 'active', total_visits: 1, last_visit: daysAgo(0), join_date: daysAgo(2), postal_code: '8008', city: 'Zürich', coach_id: null, coach: null },
  { id: 'm30', gym_id: 'demo-gym-id', name: 'Alina Schmid', email: 'alina.schmid@sunrise.ch', phone: '+41 77 890 1234', membership_type: 'trial', monthly_fee: 0, activity_status: 'moderate', total_visits: 1, last_visit: daysAgo(4), join_date: daysAgo(6), postal_code: '8032', city: 'Zürich', coach_id: null, coach: null },
];

// ============================================================
// OVERVIEW & STATS
// ============================================================

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
    { id: 'alert-1', title: '3 overdue payments', message: 'Members with pending payments require attention', severity: 'warning', created_at: new Date().toISOString() },
    { id: 'alert-2', title: '12 inactive members', message: "Members who haven't visited in 14+ days", severity: 'info', created_at: new Date().toISOString() },
  ],
};

export const DEMO_GROWTH = {
  newMembersThisMonth: 18,
  newMembersLastMonth: 14,
  growthRate: 28.6,
};

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
  total: 7,
  active: 6,
  totalClients: 113,
  totalRevenue: 13100,
};

export const DEMO_PAYMENT_STATS = {
  revenueThisMonth: 12450,
  pendingAmount: 227,
  overdueAmount: 227,
  totalPaid: 45600,
};

// ============================================================
// TODAY'S SESSIONS (5 fixed sessions for dashboard)
// ============================================================

export const DEMO_SESSIONS = [
  { id: 'session-1', title: 'Morning CrossFit', session_type: 'group', start_time: todayAt(7, 0), end_time: todayAt(8, 0), status: 'completed', coach: { id: 'c1', name: 'Marco Bianchi' } },
  { id: 'session-2', title: 'Personal Training', session_type: 'personal', start_time: todayAt(9, 0), end_time: todayAt(10, 0), status: 'completed', coach: { id: 'c2', name: 'Sofia Meier' } },
  { id: 'session-3', title: 'HIIT Class', session_type: 'class', start_time: todayAt(12, 0), end_time: todayAt(13, 0), status: 'scheduled', coach: { id: 'c3', name: 'Luca Schneider' } },
  { id: 'session-4', title: 'Yoga Flow', session_type: 'class', start_time: todayAt(14, 0), end_time: todayAt(15, 0), status: 'scheduled', coach: { id: 'c4', name: 'Elena Weber' } },
  { id: 'session-5', title: 'Strength Training', session_type: 'group', start_time: todayAt(17, 0), end_time: todayAt(18, 0), status: 'scheduled', coach: { id: 'c1', name: 'Marco Bianchi' } },
];

// ============================================================
// DYNAMIC SESSIONS FOR CALENDAR (getByDateRange)
// ============================================================

const SESSION_TEMPLATES = [
  { title: 'Morning CrossFit', session_type: 'group', hour: 7, duration: 60, coachId: 'c1', coachName: 'Marco Bianchi', max_participants: 20, price: 25 },
  { title: 'Yoga Flow', session_type: 'class', hour: 8, duration: 60, coachId: 'c4', coachName: 'Elena Weber', max_participants: 15, price: 20 },
  { title: 'Personal Training', session_type: 'personal', hour: 9, duration: 60, coachId: 'c2', coachName: 'Sofia Meier', max_participants: 1, price: 100 },
  { title: 'HIIT Blast', session_type: 'class', hour: 10, duration: 45, coachId: 'c3', coachName: 'Luca Schneider', max_participants: 25, price: 20 },
  { title: 'Pilates Basics', session_type: 'class', hour: 12, duration: 60, coachId: 'c4', coachName: 'Elena Weber', max_participants: 12, price: 20 },
  { title: 'Power Lunch Workout', session_type: 'group', hour: 13, duration: 45, coachId: 'c3', coachName: 'Luca Schneider', max_participants: 20, price: 15 },
  { title: 'Strength Fundamentals', session_type: 'group', hour: 16, duration: 60, coachId: 'c5', coachName: 'Noah Keller', max_participants: 12, price: 25 },
  { title: 'Evening CrossFit', session_type: 'group', hour: 17, duration: 60, coachId: 'c1', coachName: 'Marco Bianchi', max_participants: 20, price: 25 },
  { title: 'Functional Training', session_type: 'class', hour: 18, duration: 60, coachId: 'c3', coachName: 'Luca Schneider', max_participants: 20, price: 20 },
  { title: 'Late Night Yoga', session_type: 'class', hour: 19, duration: 60, coachId: 'c4', coachName: 'Elena Weber', max_participants: 15, price: 20 },
];

/** Generate deterministic sessions for a date range (6-10 per day) */
export function getDemoSessionsForDateRange(startDate: Date, endDate: Date) {
  const sessions: Array<{
    id: string;
    gym_id: string;
    coach_id: string;
    member_id: null;
    title: string;
    description: null;
    session_type: string;
    start_time: string;
    end_time: string;
    status: string;
    price: number;
    max_participants: number;
    current_participants: number;
    location: null;
    notes: null;
    created_at: string;
    updated_at: string;
    coach: { id: string; name: string; avatar_url: null };
    member: null;
  }> = [];
  const current = new Date(startDate);
  const now = new Date();

  while (current <= endDate) {
    const dayOfWeek = current.getDay(); // 0=Sun
    if (dayOfWeek === 0) { current.setDate(current.getDate() + 1); continue; } // Skip Sundays

    // Use day-of-year as seed to pick which templates to include
    const dayOfYear = Math.floor((current.getTime() - new Date(current.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const isSaturday = dayOfWeek === 6;
    const templateCount = isSaturday ? 6 : (dayOfYear % 3 === 0 ? 8 : dayOfYear % 3 === 1 ? 9 : 10);
    const dayTemplates = SESSION_TEMPLATES.slice(0, templateCount);

    dayTemplates.forEach((tpl, idx) => {
      const start = new Date(current);
      start.setHours(tpl.hour, 0, 0, 0);
      const end = new Date(start.getTime() + tpl.duration * 60 * 1000);

      const status = start < now ? 'completed' : 'scheduled';
      const participants = Math.min(tpl.max_participants, 3 + ((dayOfYear + idx) % (tpl.max_participants - 2)));

      sessions.push({
        id: `demo-session-${current.toISOString().slice(0, 10)}-${idx}`,
        gym_id: 'demo-gym-id',
        coach_id: tpl.coachId,
        member_id: null,
        title: tpl.title,
        description: null,
        session_type: tpl.session_type,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status,
        price: tpl.price,
        max_participants: tpl.max_participants,
        current_participants: participants,
        location: null,
        notes: null,
        created_at: daysAgo(30),
        updated_at: daysAgo(1),
        coach: { id: tpl.coachId, name: tpl.coachName, avatar_url: null },
        member: null,
      });
    });

    current.setDate(current.getDate() + 1);
  }

  return sessions;
}

// ============================================================
// PAYMENTS
// ============================================================

export const DEMO_PAYMENTS = [
  { id: 'p1', gym_id: 'demo-gym-id', member_id: 'm5', amount: 89, status: 'paid', due_date: new Date().toISOString(), paid_date: new Date().toISOString(), payment_method: 'card', description: 'Monthly membership - February 2026', member: { id: 'm5', name: 'Luca Müller', email: 'luca.mueller@gmail.com' } },
  { id: 'p2', gym_id: 'demo-gym-id', member_id: 'm1', amount: 149, status: 'paid', due_date: new Date().toISOString(), paid_date: new Date().toISOString(), payment_method: 'bank_transfer', description: 'Monthly membership - February 2026', member: { id: 'm1', name: 'Emma Schneider', email: 'emma.schneider@outlook.com' } },
  { id: 'p3', gym_id: 'demo-gym-id', member_id: 'm17', amount: 49, status: 'pending', due_date: new Date().toISOString(), paid_date: null, payment_method: null, description: 'Monthly membership - February 2026', member: { id: 'm17', name: 'Noah Weber', email: 'noah.weber@bluewin.ch' } },
  { id: 'p4', gym_id: 'demo-gym-id', member_id: 'm6', amount: 89, status: 'overdue', due_date: daysAgo(15), paid_date: null, payment_method: null, description: 'Monthly membership - February 2026', member: { id: 'm6', name: 'Sofia Keller', email: 'sofia.keller@sunrise.ch' } },
  { id: 'p5', gym_id: 'demo-gym-id', member_id: 'm7', amount: 89, status: 'paid', due_date: new Date().toISOString(), paid_date: daysAgo(2), payment_method: 'card', description: 'Monthly membership - February 2026', member: { id: 'm7', name: 'Mia Huber', email: 'mia.huber@gmail.com' } },
  { id: 'p6', gym_id: 'demo-gym-id', member_id: 'm18', amount: 49, status: 'overdue', due_date: daysAgo(20), paid_date: null, payment_method: null, description: 'Monthly membership - February 2026', member: { id: 'm18', name: 'Elias Brunner', email: 'elias.brunner@outlook.com' } },
  { id: 'p7', gym_id: 'demo-gym-id', member_id: 'm2', amount: 149, status: 'paid', due_date: new Date().toISOString(), paid_date: new Date().toISOString(), payment_method: 'card', description: 'Monthly membership - February 2026', member: { id: 'm2', name: 'Laura Zimmermann', email: 'laura.zimmermann@bluewin.ch' } },
  { id: 'p8', gym_id: 'demo-gym-id', member_id: 'm8', amount: 89, status: 'pending', due_date: daysAgo(-5), paid_date: null, payment_method: null, description: 'Monthly membership - February 2026', member: { id: 'm8', name: 'David Steiner', email: 'david.steiner@sunrise.ch' } },
  { id: 'p9', gym_id: 'demo-gym-id', member_id: 'm19', amount: 49, status: 'paid', due_date: new Date().toISOString(), paid_date: daysAgo(1), payment_method: 'bank_transfer', description: 'Monthly membership - February 2026', member: { id: 'm19', name: 'Anna Gerber', email: 'anna.gerber@protonmail.com' } },
];

// ============================================================
// ANALYTICS
// ============================================================

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

// Revenue by month — deterministic, no Math.random()
export const DEMO_REVENUE_BY_MONTH: Record<string, number> = {
  [monthKey(5)]: 9500,
  [monthKey(4)]: 9950,
  [monthKey(3)]: 10400,
  [monthKey(2)]: 10850,
  [monthKey(1)]: 11700,
  [monthKey(0)]: 12450,
};

// Retention data — dynamic month labels
const retentionMonths = getRecentMonths(6);
export const DEMO_RETENTION_DATA = [
  { month: retentionMonths[0], rate: 92 },
  { month: retentionMonths[1], rate: 89 },
  { month: retentionMonths[2], rate: 91 },
  { month: retentionMonths[3], rate: 88 },
  { month: retentionMonths[4], rate: 85 },
  { month: retentionMonths[5], rate: 94 },
];

export const DEMO_CLASS_ATTENDANCE = [
  { name: 'CrossFit', attendance: 156, capacity: 180, rate: 87 },
  { name: 'Yoga', attendance: 132, capacity: 150, rate: 88 },
  { name: 'HIIT', attendance: 98, capacity: 120, rate: 82 },
  { name: 'Pilates', attendance: 72, capacity: 90, rate: 80 },
  { name: 'Boxing', attendance: 64, capacity: 80, rate: 80 },
  { name: 'Strength', attendance: 88, capacity: 100, rate: 88 },
];

export const DEMO_COACH_PERFORMANCE = [
  { name: 'Marco Bianchi', sessions: 48, revenue: 5760, rating: 4.9 },
  { name: 'Sofia Meier', sessions: 52, revenue: 5200, rating: 4.8 },
  { name: 'Elena Weber', sessions: 44, revenue: 4400, rating: 4.9 },
  { name: 'Luca Schneider', sessions: 36, revenue: 2880, rating: 4.7 },
  { name: 'Noah Keller', sessions: 32, revenue: 2560, rating: 4.6 },
];

export const DEMO_ACQUISITION_CHANNELS = [
  { name: 'Referral', value: 42, color: 'hsl(23, 87%, 55%)' },
  { name: 'Website', value: 28, color: 'hsl(220, 70%, 50%)' },
  { name: 'Social Media', value: 18, color: 'hsl(142, 76%, 36%)' },
  { name: 'Walk-in', value: 12, color: 'hsl(38, 92%, 50%)' },
];

// Churn risk — now all IDs exist in DEMO_MEMBERS
export const DEMO_CHURN_RISK = [
  { id: 'm18', name: 'Elias Brunner', lastVisit: '30 days ago', membership: 'Basic', risk: 'high' as const },
  { id: 'm11', name: 'Tim Gerber', lastVisit: '18 days ago', membership: 'Premium', risk: 'high' as const },
  { id: 'm12', name: 'Sandra Roth', lastVisit: '15 days ago', membership: 'Premium', risk: 'medium' as const },
  { id: 'm13', name: 'Patrick Wyss', lastVisit: '14 days ago', membership: 'Premium', risk: 'medium' as const },
  { id: 'm21', name: 'Melanie Suter', lastVisit: '35 days ago', membership: 'Basic', risk: 'high' as const },
  { id: 'm24', name: 'Dominik Hofmann', lastVisit: '28 days ago', membership: 'Basic', risk: 'high' as const },
];

export const DEMO_MONTHLY_COMPARISON = {
  visits: { current: 2847, previous: 2654, change: 7.3 },
  newMembers: { current: 18, previous: 14, change: 28.6 },
  revenue: { current: 12450, previous: 11200, change: 11.2 },
  churnRate: { current: 2.1, previous: 3.4, change: -38.2 },
  avgVisitsPerMember: { current: 8.4, previous: 7.9, change: 6.3 },
  classAttendance: { current: 610, previous: 542, change: 12.5 },
};

// ============================================================
// ALERTS (8 realistic alerts)
// ============================================================

export const DEMO_ALERTS = [
  { id: 'alert-d1', gym_id: 'demo-gym-id', type: 'payment_overdue', severity: 'critical', title: 'Payment overdue', message: 'Sofia Keller has an overdue payment of CHF 89.00.', is_read: false, related_id: 'm6', related_type: 'member', created_at: hoursAgo(2) },
  { id: 'alert-d2', gym_id: 'demo-gym-id', type: 'payment_overdue', severity: 'critical', title: 'Payment overdue', message: 'Elias Brunner has an overdue payment of CHF 49.00.', is_read: false, related_id: 'm18', related_type: 'member', created_at: hoursAgo(5) },
  { id: 'alert-d3', gym_id: 'demo-gym-id', type: 'membership_expiring', severity: 'warning', title: 'Membership expiring in 3 days', message: "Matteo Fischer's trial membership expires soon.", is_read: false, related_id: 'm27', related_type: 'member', created_at: hoursAgo(8) },
  { id: 'alert-d4', gym_id: 'demo-gym-id', type: 'low_attendance', severity: 'warning', title: 'Low attendance warning', message: 'Melanie Suter has not visited in 35 days.', is_read: false, related_id: 'm21', related_type: 'member', created_at: hoursAgo(12) },
  { id: 'alert-d5', gym_id: 'demo-gym-id', type: 'low_attendance', severity: 'info', title: 'Attendance declining', message: 'Tim Gerber visit frequency dropped by 60%.', is_read: false, related_id: 'm11', related_type: 'member', created_at: daysAgo(1) },
  { id: 'alert-d6', gym_id: 'demo-gym-id', type: 'new_member', severity: 'info', title: 'New member joined', message: 'Nico Berger signed up for a trial membership.', is_read: true, related_id: 'm29', related_type: 'member', created_at: daysAgo(2) },
  { id: 'alert-d7', gym_id: 'demo-gym-id', type: 'target_achieved', severity: 'info', title: 'Monthly revenue target achieved!', message: 'You\'ve reached CHF 12,450 this month — 104% of target.', is_read: true, related_id: null, related_type: null, created_at: daysAgo(3) },
  { id: 'alert-d8', gym_id: 'demo-gym-id', type: 'coach_time_off', severity: 'info', title: 'Coach time-off request', message: 'Anna Fischer requested parental leave extension until April.', is_read: true, related_id: 'c6', related_type: 'coach', created_at: daysAgo(5) },
];

// ============================================================
// MESSAGES & STAFF
// ============================================================

export const DEMO_STAFF = [
  { id: 'staff-1', full_name: 'Daniel Pauli', avatar_url: null, email: 'daniel.pauli@prometheus-gym.ch', role: 'owner' },
  { id: 'staff-2', full_name: 'Marco Bianchi', avatar_url: null, email: 'marco.bianchi@prometheus-gym.ch', role: 'coach' },
  { id: 'staff-3', full_name: 'Sofia Meier', avatar_url: null, email: 'sofia.meier@prometheus-gym.ch', role: 'coach' },
  { id: 'staff-4', full_name: 'Lisa Bauer', avatar_url: null, email: 'lisa.bauer@prometheus-gym.ch', role: 'receptionist' },
];

export const DEMO_MESSAGES = [
  {
    id: 'msg-1', gym_id: 'demo-gym-id', sender_id: 'staff-2', recipient_id: 'staff-1', subject: 'Equipment maintenance needed', content: 'Hi Daniel, the cable machine on station 3 needs repair. The pulley is making grinding noises. Can we get a technician this week?', is_broadcast: false, is_read: false, read_at: null, created_at: hoursAgo(1),
    sender: { id: 'staff-2', full_name: 'Marco Bianchi', avatar_url: null, email: 'marco.bianchi@prometheus-gym.ch' },
  },
  {
    id: 'msg-2', gym_id: 'demo-gym-id', sender_id: 'staff-3', recipient_id: 'staff-1', subject: 'New group class proposal', content: 'I\'d like to add a Saturday morning mobility class. There\'s been high demand from several members. Shall we discuss the schedule?', is_broadcast: false, is_read: false, read_at: null, created_at: hoursAgo(4),
    sender: { id: 'staff-3', full_name: 'Sofia Meier', avatar_url: null, email: 'sofia.meier@prometheus-gym.ch' },
  },
  {
    id: 'msg-3', gym_id: 'demo-gym-id', sender_id: 'staff-4', recipient_id: 'staff-1', subject: 'Reception shift swap request', content: 'Could I swap my Thursday evening shift with the Friday morning one next week? I have a doctor\'s appointment.', is_broadcast: false, is_read: false, read_at: null, created_at: hoursAgo(8),
    sender: { id: 'staff-4', full_name: 'Lisa Bauer', avatar_url: null, email: 'lisa.bauer@prometheus-gym.ch' },
  },
  {
    id: 'msg-4', gym_id: 'demo-gym-id', sender_id: 'staff-1', recipient_id: null, subject: 'Team meeting this Friday', content: 'Reminder: Monthly team meeting this Friday at 10:00 in the office. Agenda: Q1 review, summer schedule planning, new equipment budget.', is_broadcast: true, is_read: true, read_at: daysAgo(1), created_at: daysAgo(2),
    sender: { id: 'staff-1', full_name: 'Daniel Pauli', avatar_url: null, email: 'daniel.pauli@prometheus-gym.ch' },
  },
  {
    id: 'msg-5', gym_id: 'demo-gym-id', sender_id: 'staff-2', recipient_id: 'staff-1', subject: 'CrossFit competition sponsorship', content: 'Local CrossFit competition in March is looking for sponsors. Great marketing opportunity. Budget would be around CHF 500. Worth it?', is_broadcast: false, is_read: true, read_at: daysAgo(1), created_at: daysAgo(3),
    sender: { id: 'staff-2', full_name: 'Marco Bianchi', avatar_url: null, email: 'marco.bianchi@prometheus-gym.ch' },
  },
  {
    id: 'msg-6', gym_id: 'demo-gym-id', sender_id: 'staff-3', recipient_id: 'staff-1', subject: 'Member feedback summary', content: 'Collected feedback from 15 members last week. Main points: want more evening classes, love the new equipment, suggestion for a smoothie bar.', is_broadcast: false, is_read: true, read_at: daysAgo(3), created_at: daysAgo(4),
    sender: { id: 'staff-3', full_name: 'Sofia Meier', avatar_url: null, email: 'sofia.meier@prometheus-gym.ch' },
  },
  {
    id: 'msg-7', gym_id: 'demo-gym-id', sender_id: 'staff-1', recipient_id: null, subject: 'Holiday schedule update', content: 'Updated opening hours for the upcoming holidays are now posted. Please check and confirm your availability.', is_broadcast: true, is_read: true, read_at: daysAgo(5), created_at: daysAgo(7),
    sender: { id: 'staff-1', full_name: 'Daniel Pauli', avatar_url: null, email: 'daniel.pauli@prometheus-gym.ch' },
  },
];

// ============================================================
// ACCESS LOGS, STATS & SETTINGS
// ============================================================

function generateAccessLogs(): Array<{
  id: string;
  gym_id: string;
  member_id: string;
  member_name: string;
  access_method: AccessMethod;
  access_status: AccessStatus;
  confidence_score: number | null;
  device_id: string | null;
  denial_reason: string | null;
  terminal_id: string | null;
  terminal_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  attempted_at: string;
  visit_id: string | null;
}> {
  const methods: AccessMethod[] = ['face_recognition', 'bluetooth', 'manual', 'qr_code'];
  const memberIds = DEMO_MEMBERS.filter(m => m.activity_status !== 'inactive').map(m => m.id);
  const logs = [];

  for (let i = 0; i < 50; i++) {
    const mIdx = i % memberIds.length;
    const member = DEMO_MEMBERS.find(m => m.id === memberIds[mIdx])!;
    const method = methods[i % 4];
    const isGranted = i < 46; // 46 granted, 4 denied
    const minutesAgo = i * 35; // spread over ~29 hours

    logs.push({
      id: `access-log-${i + 1}`,
      gym_id: 'demo-gym-id',
      member_id: member.id,
      member_name: member.name,
      access_method: method,
      access_status: (isGranted ? 'granted' : 'denied') as AccessStatus,
      confidence_score: method === 'face_recognition' ? (isGranted ? 0.92 + (i % 8) * 0.01 : 0.45) : null,
      device_id: method === 'bluetooth' ? `device-${member.id}` : null,
      denial_reason: isGranted ? null : (i === 46 ? 'Membership expired' : i === 47 ? 'Low confidence score' : i === 48 ? 'Gym closed' : 'Unknown member'),
      terminal_id: 'terminal-1',
      terminal_name: 'Main Entrance',
      ip_address: null,
      user_agent: null,
      attempted_at: new Date(Date.now() - minutesAgo * 60 * 1000).toISOString(),
      visit_id: isGranted ? `visit-${i + 1}` : null,
    });
  }

  return logs;
}

export const DEMO_ACCESS_LOGS = generateAccessLogs();

export const DEMO_ACCESS_STATS = {
  totalAttempts: 50,
  granted: 46,
  denied: 4,
  byMethod: {
    face_recognition: 13,
    bluetooth: 13,
    manual: 12,
    qr_code: 12,
  } as Record<AccessMethod, number>,
};

export const DEMO_ACCESS_SETTINGS = {
  id: 'settings-1',
  gym_id: 'demo-gym-id',
  bluetooth_enabled: true,
  face_recognition_enabled: true,
  qr_code_enabled: true,
  manual_checkin_enabled: true,
  face_match_threshold: 0.85,
  require_liveness_check: true,
  bluetooth_range_meters: 5,
  auto_checkout_enabled: true,
  auto_checkout_minutes: 120,
  require_active_membership: true,
  allow_expired_grace_days: 3,
  opening_hours: {
    monday: { open: '06:00', close: '22:00', closed: false },
    tuesday: { open: '06:00', close: '22:00', closed: false },
    wednesday: { open: '06:00', close: '22:00', closed: false },
    thursday: { open: '06:00', close: '22:00', closed: false },
    friday: { open: '06:00', close: '22:00', closed: false },
    saturday: { open: '08:00', close: '20:00', closed: false },
    sunday: { open: '08:00', close: '18:00', closed: false },
  },
  holiday_closures: [],
  notify_on_denied_access: true,
  notify_on_after_hours_attempt: true,
  created_at: daysAgo(200),
  updated_at: daysAgo(5),
};

// ============================================================
// MEMBER VISITS (visit history per member)
// ============================================================

export function getDemoMemberVisits(memberId: string) {
  const member = DEMO_MEMBERS.find(m => m.id === memberId);
  if (!member) return [];

  const visits = [];
  const totalVisits = Math.min(member.total_visits, 30);
  const methods: AccessMethod[] = ['face_recognition', 'bluetooth', 'manual', 'qr_code'];

  for (let i = 0; i < totalVisits; i++) {
    const dayOffset = i * 2 + (i % 3); // Spread visits out
    const checkIn = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
    checkIn.setHours(6 + (i % 16), (i * 17) % 60, 0, 0);
    const checkOut = new Date(checkIn.getTime() + (60 + (i % 4) * 30) * 60 * 1000);

    visits.push({
      id: `visit-${memberId}-${i}`,
      member_id: memberId,
      gym_id: 'demo-gym-id',
      check_in: checkIn.toISOString(),
      check_out: i === 0 ? null : checkOut.toISOString(), // First visit still active
      check_in_method: methods[i % 4],
      created_at: checkIn.toISOString(),
    });
  }

  return visits;
}

// ============================================================
// RECENT ACTIVITY (for dashboard)
// ============================================================

export const DEMO_RECENT_ACTIVITY = [
  { id: 'ra-1', member_id: 'm5', gym_id: 'demo-gym-id', check_in: hoursAgo(0.5), check_out: null, check_in_method: 'face_recognition' as AccessMethod, created_at: hoursAgo(0.5), member: { id: 'm5', name: 'Luca Müller', avatar_url: null } },
  { id: 'ra-2', member_id: 'm1', gym_id: 'demo-gym-id', check_in: hoursAgo(1), check_out: null, check_in_method: 'bluetooth' as AccessMethod, created_at: hoursAgo(1), member: { id: 'm1', name: 'Emma Schneider', avatar_url: null } },
  { id: 'ra-3', member_id: 'm9', gym_id: 'demo-gym-id', check_in: hoursAgo(1.5), check_out: null, check_in_method: 'qr_code' as AccessMethod, created_at: hoursAgo(1.5), member: { id: 'm9', name: 'Lea Bachmann', avatar_url: null } },
  { id: 'ra-4', member_id: 'm16', gym_id: 'demo-gym-id', check_in: hoursAgo(2), check_out: hoursAgo(1), check_in_method: 'face_recognition' as AccessMethod, created_at: hoursAgo(2), member: { id: 'm16', name: 'Céline Meier', avatar_url: null } },
  { id: 'ra-5', member_id: 'm7', gym_id: 'demo-gym-id', check_in: hoursAgo(2.5), check_out: hoursAgo(1.5), check_in_method: 'manual' as AccessMethod, created_at: hoursAgo(2.5), member: { id: 'm7', name: 'Mia Huber', avatar_url: null } },
  { id: 'ra-6', member_id: 'm3', gym_id: 'demo-gym-id', check_in: hoursAgo(3), check_out: hoursAgo(2), check_in_method: 'bluetooth' as AccessMethod, created_at: hoursAgo(3), member: { id: 'm3', name: 'Thomas Brunner', avatar_url: null } },
  { id: 'ra-7', member_id: 'm14', gym_id: 'demo-gym-id', check_in: hoursAgo(3.5), check_out: hoursAgo(2.5), check_in_method: 'face_recognition' as AccessMethod, created_at: hoursAgo(3.5), member: { id: 'm14', name: 'Julia Frei', avatar_url: null } },
  { id: 'ra-8', member_id: 'm27', gym_id: 'demo-gym-id', check_in: hoursAgo(4), check_out: hoursAgo(3), check_in_method: 'manual' as AccessMethod, created_at: hoursAgo(4), member: { id: 'm27', name: 'Matteo Fischer', avatar_url: null } },
  { id: 'ra-9', member_id: 'm19', gym_id: 'demo-gym-id', check_in: hoursAgo(5), check_out: hoursAgo(4), check_in_method: 'qr_code' as AccessMethod, created_at: hoursAgo(5), member: { id: 'm19', name: 'Anna Gerber', avatar_url: null } },
  { id: 'ra-10', member_id: 'm26', gym_id: 'demo-gym-id', check_in: hoursAgo(6), check_out: hoursAgo(5), check_in_method: 'bluetooth' as AccessMethod, created_at: hoursAgo(6), member: { id: 'm26', name: 'Raphael Ammann', avatar_url: null } },
];

// ============================================================
// COACH INTEGRATION DEMO DATA
// ============================================================

export const DEMO_COACH_INTEGRATIONS = [
  { id: 'ci-1', gym_id: 'demo-gym-id', coach_id: 'c1', coach_app_user_id: 'coach-app-user-1', coach_app_email: 'marco.bianchi@prometheus-gym.ch', status: 'linked' as const, linked_at: daysAgo(60), last_sync_at: hoursAgo(2), cached_data: { totalClients: 18, totalWorkouts: 45, totalPrograms: 6, activeSessions: 12, lastActivity: daysAgo(0) }, created_at: daysAgo(90), updated_at: hoursAgo(2) },
  { id: 'ci-2', gym_id: 'demo-gym-id', coach_id: 'c2', coach_app_user_id: 'coach-app-user-2', coach_app_email: 'sofia.meier@prometheus-gym.ch', status: 'linked' as const, linked_at: daysAgo(45), last_sync_at: hoursAgo(4), cached_data: { totalClients: 24, totalWorkouts: 62, totalPrograms: 8, activeSessions: 18, lastActivity: daysAgo(0) }, created_at: daysAgo(60), updated_at: hoursAgo(4) },
  { id: 'ci-3', gym_id: 'demo-gym-id', coach_id: 'c4', coach_app_user_id: 'coach-app-user-3', coach_app_email: 'elena.weber@prometheus-gym.ch', status: 'linked' as const, linked_at: daysAgo(30), last_sync_at: hoursAgo(6), cached_data: { totalClients: 22, totalWorkouts: 38, totalPrograms: 5, activeSessions: 10, lastActivity: daysAgo(1) }, created_at: daysAgo(45), updated_at: hoursAgo(6) },
  { id: 'ci-4', gym_id: 'demo-gym-id', coach_id: 'c7', coach_app_user_id: 'coach-app-user-dp', coach_app_email: 'danielepauli@gmail.com', status: 'linked' as const, linked_at: daysAgo(90), last_sync_at: hoursAgo(1), cached_data: { totalClients: 14, totalWorkouts: 52, totalPrograms: 7, activeSessions: 16, lastActivity: daysAgo(0) }, created_at: daysAgo(120), updated_at: hoursAgo(1) },
];

export const DEMO_COACH_SUMMARIES: Record<string, CoachSummary> = {
  'coach-app-user-1': { userId: 'coach-app-user-1', email: 'marco.bianchi@prometheus-gym.ch', fullName: 'Marco Bianchi', totalClients: 18, totalWorkouts: 45, totalPrograms: 6, activeSessions: 12, lastActivity: daysAgo(0) },
  'coach-app-user-2': { userId: 'coach-app-user-2', email: 'sofia.meier@prometheus-gym.ch', fullName: 'Sofia Meier', totalClients: 24, totalWorkouts: 62, totalPrograms: 8, activeSessions: 18, lastActivity: daysAgo(0) },
  'coach-app-user-3': { userId: 'coach-app-user-3', email: 'elena.weber@prometheus-gym.ch', fullName: 'Elena Weber', totalClients: 22, totalWorkouts: 38, totalPrograms: 5, activeSessions: 10, lastActivity: daysAgo(1) },
  'coach-app-user-dp': { userId: 'coach-app-user-dp', email: 'danielepauli@gmail.com', fullName: 'Daniele Pauli', totalClients: 14, totalWorkouts: 52, totalPrograms: 7, activeSessions: 16, lastActivity: daysAgo(0) },
};

export const DEMO_COACH_CLIENTS: Record<string, CoachClient[]> = {
  'coach-app-user-1': [
    { id: 'cc-1', name: 'Luca Müller', email: 'luca.mueller@gmail.com', status: 'active', startDate: daysAgo(180), lastSession: daysAgo(2) },
    { id: 'cc-2', name: 'Laura Zimmermann', email: 'laura.zimmermann@bluewin.ch', status: 'active', startDate: daysAgo(400), lastSession: daysAgo(1) },
    { id: 'cc-3', name: 'Thomas Brunner', email: 'thomas.brunner@gmail.com', status: 'active', startDate: daysAgo(500), lastSession: daysAgo(3) },
  ],
  'coach-app-user-2': [
    { id: 'cc-4', name: 'Emma Schneider', email: 'emma.schneider@outlook.com', status: 'active', startDate: daysAgo(365), lastSession: daysAgo(1) },
    { id: 'cc-5', name: 'Lea Bachmann', email: 'lea.bachmann@protonmail.com', status: 'active', startDate: daysAgo(150), lastSession: daysAgo(0) },
    { id: 'cc-6', name: 'Céline Meier', email: 'celine.meier@gmail.com', status: 'active', startDate: daysAgo(160), lastSession: daysAgo(2) },
  ],
  'coach-app-user-3': [
    { id: 'cc-7', name: 'Sofia Keller', email: 'sofia.keller@sunrise.ch', status: 'active', startDate: daysAgo(120), lastSession: daysAgo(1) },
    { id: 'cc-8', name: 'Nina Hartmann', email: 'nina.hartmann@sunrise.ch', status: 'active', startDate: daysAgo(200), lastSession: daysAgo(5) },
    { id: 'cc-9', name: 'Julia Frei', email: 'julia.frei@protonmail.com', status: 'active', startDate: daysAgo(170), lastSession: daysAgo(2) },
  ],
  'coach-app-user-dp': [
    { id: 'cc-10', name: 'Raphael Ammann', email: 'raphael.ammann@bluewin.ch', status: 'active', startDate: daysAgo(320), lastSession: daysAgo(1) },
    { id: 'cc-11', name: 'Fabienne Gerber', email: 'fabienne.gerber@gmail.com', status: 'active', startDate: daysAgo(280), lastSession: daysAgo(0) },
    { id: 'cc-12', name: 'Marco Wyss', email: 'marco.wyss@protonmail.com', status: 'active', startDate: daysAgo(240), lastSession: daysAgo(2) },
    { id: 'cc-13', name: 'Janine Bühler', email: 'janine.buehler@sunrise.ch', status: 'active', startDate: daysAgo(190), lastSession: daysAgo(1) },
    { id: 'cc-14', name: 'Patrick Lehmann', email: 'patrick.lehmann@outlook.com', status: 'active', startDate: daysAgo(150), lastSession: daysAgo(3) },
    { id: 'cc-15', name: 'Selina Roth', email: 'selina.roth@gmail.com', status: 'active', startDate: daysAgo(130), lastSession: daysAgo(0) },
    { id: 'cc-16', name: 'Tim Baumann', email: 'tim.baumann@bluewin.ch', status: 'active', startDate: daysAgo(100), lastSession: daysAgo(4) },
    { id: 'cc-17', name: 'Noemi Sutter', email: 'noemi.sutter@gmail.com', status: 'active', startDate: daysAgo(85), lastSession: daysAgo(1) },
    { id: 'cc-18', name: 'Nico Walther', email: 'nico.walther@protonmail.com', status: 'active', startDate: daysAgo(60), lastSession: daysAgo(2) },
    { id: 'cc-19', name: 'Alina Fehr', email: 'alina.fehr@sunrise.ch', status: 'active', startDate: daysAgo(45), lastSession: daysAgo(0) },
    { id: 'cc-20', name: 'Yannick Moser', email: 'yannick.moser@outlook.com', status: 'active', startDate: daysAgo(30), lastSession: daysAgo(5) },
    { id: 'cc-21', name: 'Lena Bosshard', email: 'lena.bosshard@gmail.com', status: 'active', startDate: daysAgo(25), lastSession: daysAgo(1) },
    { id: 'cc-22', name: 'Sven Dietrich', email: 'sven.dietrich@bluewin.ch', status: 'active', startDate: daysAgo(15), lastSession: daysAgo(3) },
    { id: 'cc-23', name: 'Chiara Volpe', email: 'chiara.volpe@gmail.com', status: 'active', startDate: daysAgo(10), lastSession: daysAgo(0) },
  ],
};

export const DEMO_COACH_WORKOUTS: Record<string, CoachWorkout[]> = {
  'coach-app-user-1': [
    { id: 'cw-1', title: 'Full Body CrossFit', type: 'crossfit', duration: 60, exerciseCount: 8, createdAt: daysAgo(30) },
    { id: 'cw-2', title: 'Upper Body Strength', type: 'strength', duration: 45, exerciseCount: 6, createdAt: daysAgo(25) },
    { id: 'cw-3', title: 'EMOM Challenge', type: 'crossfit', duration: 30, exerciseCount: 5, createdAt: daysAgo(15) },
  ],
  'coach-app-user-2': [
    { id: 'cw-4', title: 'Body Transformation Circuit', type: 'circuit', duration: 50, exerciseCount: 10, createdAt: daysAgo(20) },
    { id: 'cw-5', title: 'Core & Stability', type: 'functional', duration: 30, exerciseCount: 7, createdAt: daysAgo(12) },
    { id: 'cw-6', title: 'Fat Burn HIIT', type: 'hiit', duration: 25, exerciseCount: 8, createdAt: daysAgo(8) },
  ],
  'coach-app-user-3': [
    { id: 'cw-7', title: 'Vinyasa Flow', type: 'yoga', duration: 60, exerciseCount: 12, createdAt: daysAgo(18) },
    { id: 'cw-8', title: 'Yin Yoga Relax', type: 'yoga', duration: 75, exerciseCount: 10, createdAt: daysAgo(10) },
    { id: 'cw-9', title: 'Mobility & Stretch', type: 'mobility', duration: 30, exerciseCount: 8, createdAt: daysAgo(5) },
  ],
  'coach-app-user-dp': [
    { id: 'cw-10', title: 'Full Body Strength A', type: 'strength', duration: 60, exerciseCount: 8, createdAt: daysAgo(28) },
    { id: 'cw-11', title: 'Full Body Strength B', type: 'strength', duration: 60, exerciseCount: 8, createdAt: daysAgo(26) },
    { id: 'cw-12', title: 'Upper/Lower Split - Upper', type: 'strength', duration: 55, exerciseCount: 7, createdAt: daysAgo(21) },
    { id: 'cw-13', title: 'Upper/Lower Split - Lower', type: 'strength', duration: 55, exerciseCount: 7, createdAt: daysAgo(21) },
    { id: 'cw-14', title: 'Functional Circuit', type: 'functional', duration: 45, exerciseCount: 10, createdAt: daysAgo(14) },
    { id: 'cw-15', title: 'Kettlebell Complex', type: 'functional', duration: 35, exerciseCount: 6, createdAt: daysAgo(10) },
    { id: 'cw-16', title: 'Olympic Lifting Basics', type: 'strength', duration: 50, exerciseCount: 5, createdAt: daysAgo(7) },
    { id: 'cw-17', title: 'Metabolic Conditioning', type: 'hiit', duration: 30, exerciseCount: 8, createdAt: daysAgo(3) },
    { id: 'cw-18', title: 'Recovery & Mobility Flow', type: 'mobility', duration: 40, exerciseCount: 12, createdAt: daysAgo(1) },
  ],
};

export const DEMO_COACH_PROGRAMS: Record<string, CoachProgram[]> = {
  'coach-app-user-1': [
    { id: 'cp-1', title: '12-Week Strength Builder', description: 'Progressive overload program for intermediate athletes', weekCount: 12, clientCount: 8, createdAt: daysAgo(60) },
    { id: 'cp-2', title: 'CrossFit Fundamentals', description: 'Beginner-friendly CrossFit introduction', weekCount: 6, clientCount: 5, createdAt: daysAgo(45) },
  ],
  'coach-app-user-2': [
    { id: 'cp-3', title: '8-Week Body Recomp', description: 'Body recomposition with nutrition guidance', weekCount: 8, clientCount: 12, createdAt: daysAgo(40) },
    { id: 'cp-4', title: 'Summer Shred', description: 'High-intensity fat loss program', weekCount: 6, clientCount: 10, createdAt: daysAgo(30) },
  ],
  'coach-app-user-3': [
    { id: 'cp-5', title: 'Flexibility Journey', description: 'Progressive flexibility and mobility program', weekCount: 8, clientCount: 15, createdAt: daysAgo(35) },
    { id: 'cp-6', title: 'Stress Relief Yoga', description: 'Mindfulness-based yoga for stress management', weekCount: 4, clientCount: 8, createdAt: daysAgo(20) },
  ],
  'coach-app-user-dp': [
    { id: 'cp-7', title: '12-Week Strength Foundation', description: 'Progressive overload program building a solid strength base for all levels', weekCount: 12, clientCount: 6, createdAt: daysAgo(90) },
    { id: 'cp-8', title: '8-Week Functional Athlete', description: 'Combining strength, conditioning and mobility for well-rounded fitness', weekCount: 8, clientCount: 5, createdAt: daysAgo(60) },
    { id: 'cp-9', title: '6-Week Shred', description: 'High-intensity fat loss with strength preservation', weekCount: 6, clientCount: 8, createdAt: daysAgo(42) },
    { id: 'cp-10', title: 'Beginner Strength 101', description: 'Learn the big lifts with proper form and progressive programming', weekCount: 8, clientCount: 4, createdAt: daysAgo(30) },
    { id: 'cp-11', title: 'Nutrition Reset Challenge', description: '4-week nutrition coaching with meal plans and weekly check-ins', weekCount: 4, clientCount: 10, createdAt: daysAgo(20) },
    { id: 'cp-12', title: 'Olympic Lifting Progression', description: 'Master the snatch and clean & jerk with structured progressions', weekCount: 10, clientCount: 3, createdAt: daysAgo(14) },
    { id: 'cp-13', title: 'Comeback Program', description: 'Return to training after injury or long break - gradual build-up', weekCount: 6, clientCount: 2, createdAt: daysAgo(7) },
  ],
};

// ============================================================
// COACH INVITATIONS (for workstream 1)
// ============================================================

export const DEMO_COACH_INVITATIONS = [
  { id: 'inv-1', gym_id: 'demo-gym-id', coach_id: 'c3', token: 'demo-token-abc123', coach_name: 'Luca Schneider', coach_email: 'luca.schneider@prometheus-gym.ch', gym_name: 'Prometheus Fitness Zürich', status: 'pending' as const, expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), accepted_at: null, created_by: 'staff-1', created_at: daysAgo(2), updated_at: daysAgo(2) },
  { id: 'inv-2', gym_id: 'demo-gym-id', coach_id: 'c1', token: 'demo-token-def456', coach_name: 'Marco Bianchi', coach_email: 'marco.bianchi@prometheus-gym.ch', gym_name: 'Prometheus Fitness Zürich', status: 'accepted' as const, expires_at: daysAgo(0), accepted_at: daysAgo(5), created_by: 'staff-1', created_at: daysAgo(12), updated_at: daysAgo(5) },
  { id: 'inv-3', gym_id: 'demo-gym-id', coach_id: 'c5', token: 'demo-token-ghi789', coach_name: 'Noah Keller', coach_email: 'noah.keller@prometheus-gym.ch', gym_name: 'Prometheus Fitness Zürich', status: 'expired' as const, expires_at: daysAgo(3), accepted_at: null, created_by: 'staff-1', created_at: daysAgo(14), updated_at: daysAgo(3) },
];

// ============================================================
// MEMBER NOTES (preserved from original)
// ============================================================

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
  { id: 'note-1', member_id: 'm5', note: 'Knee surgery on Jan 10 - ask how recovery is going. Avoid heavy leg exercises for 6 weeks.', priority: 'high', category: 'health', created_at: daysAgo(15), created_by: 'Sofia Meier', is_active: true },
  { id: 'note-2', member_id: 'm1', note: 'Birthday on February 3 - prepare small gift', priority: 'low', category: 'personal', created_at: daysAgo(5), created_by: 'Marco Bianchi', is_active: true },
  { id: 'note-3', member_id: 'm17', note: 'Back pain issues - prefers modified exercises. Check if physiotherapy is helping.', priority: 'high', category: 'health', created_at: daysAgo(20), created_by: 'Elena Weber', is_active: true },
  { id: 'note-4', member_id: 'm6', note: 'Interested in personal training sessions - follow up on pricing', priority: 'medium', category: 'other', created_at: daysAgo(3), created_by: 'Marco Bianchi', is_active: true },
  { id: 'note-5', member_id: 'm7', note: 'Shoulder injury from last month - avoid overhead exercises', priority: 'high', category: 'health', created_at: daysAgo(28), created_by: 'Luca Schneider', is_active: true },
  { id: 'note-6', member_id: 'm2', note: 'VIP member - always greet by name, prefers morning slots', priority: 'medium', category: 'personal', created_at: daysAgo(60), created_by: 'Marco Bianchi', is_active: true },
  { id: 'note-7', member_id: 'm8', note: 'Payment discussion pending - contact about outstanding balance', priority: 'medium', category: 'payment', created_at: daysAgo(7), created_by: 'Admin', is_active: true },
];

// ============================================================
// MEMBERSHIP PLANS (gym-defined plan templates)
// ============================================================

function dateStr(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

export const DEMO_MEMBERSHIP_PLANS = [
  // Main plans
  { id: 'plan-daily', gym_id: 'demo-gym-id', name: 'Daily Drop-In', description: 'Single day visit with no contract commitment', category: 'main' as const, billing_interval: 'daily' as const, price: 25, setup_fee: 0, min_contract_months: 0, cancellation_notice_days: 0, auto_renew: false, features: ['Gym Access', 'Group Classes'], includes_classes: true, includes_sauna: false, includes_personal_training: 0, max_members: null, current_member_count: 0, is_active: true, is_popular: false, sort_order: 0, color: '#94A3B8', created_at: daysAgo(300), updated_at: daysAgo(1) },
  { id: 'plan-monthly', gym_id: 'demo-gym-id', name: 'Monthly', description: 'Flexible monthly plan, cancel anytime', category: 'main' as const, billing_interval: 'monthly' as const, price: 89, setup_fee: 49, min_contract_months: 1, cancellation_notice_days: 30, auto_renew: true, features: ['Gym Access', 'Group Classes', 'App Access'], includes_classes: true, includes_sauna: false, includes_personal_training: 0, max_members: null, current_member_count: 18, is_active: true, is_popular: false, sort_order: 1, color: '#3B82F6', created_at: daysAgo(300), updated_at: daysAgo(1) },
  { id: 'plan-3month', gym_id: 'demo-gym-id', name: '3-Month Plan', description: '3 month commitment with auto-renewal', category: 'main' as const, billing_interval: 'quarterly' as const, price: 79, setup_fee: 49, min_contract_months: 3, cancellation_notice_days: 30, auto_renew: true, features: ['Gym Access', 'Group Classes', 'App Access', 'Sauna 1x/week'], includes_classes: true, includes_sauna: true, includes_personal_training: 0, max_members: null, current_member_count: 24, is_active: true, is_popular: true, sort_order: 2, color: '#8B5CF6', created_at: daysAgo(300), updated_at: daysAgo(1) },
  { id: 'plan-6month', gym_id: 'demo-gym-id', name: '6-Month Plan', description: '6 month commitment at a discounted rate', category: 'main' as const, billing_interval: 'semi_annual' as const, price: 69, setup_fee: 0, min_contract_months: 6, cancellation_notice_days: 60, auto_renew: true, features: ['Gym Access', 'Group Classes', 'App Access', 'Sauna', '1 PT/month'], includes_classes: true, includes_sauna: true, includes_personal_training: 1, max_members: null, current_member_count: 31, is_active: true, is_popular: false, sort_order: 3, color: '#F97316', created_at: daysAgo(300), updated_at: daysAgo(1) },
  { id: 'plan-annual', gym_id: 'demo-gym-id', name: 'Annual Plan', description: '12 month commitment, best value', category: 'main' as const, billing_interval: 'annual' as const, price: 59, setup_fee: 0, min_contract_months: 12, cancellation_notice_days: 90, auto_renew: true, features: ['Gym Access', 'All Classes', 'App Access', 'Sauna', '2 PT/month', 'Guest Pass'], includes_classes: true, includes_sauna: true, includes_personal_training: 2, max_members: null, current_member_count: 42, is_active: true, is_popular: false, sort_order: 4, color: '#EAB308', created_at: daysAgo(300), updated_at: daysAgo(1) },
  { id: 'plan-premium', gym_id: 'demo-gym-id', name: 'Premium VIP', description: 'All-inclusive with unlimited personal training', category: 'main' as const, billing_interval: 'monthly' as const, price: 199, setup_fee: 0, min_contract_months: 1, cancellation_notice_days: 30, auto_renew: true, features: ['24/7 Gym Access', 'All Classes', 'Unlimited PT', 'Sauna & Wellness', 'Nutrition Coaching', 'Priority Booking', 'Guest Pass'], includes_classes: true, includes_sauna: true, includes_personal_training: 99, max_members: 20, current_member_count: 12, is_active: true, is_popular: false, sort_order: 5, color: '#DC2626', created_at: daysAgo(300), updated_at: daysAgo(1) },
  // Addon plans
  { id: 'plan-towel', gym_id: 'demo-gym-id', name: 'Towel Service', description: 'Fresh towel on every visit', category: 'addon' as const, billing_interval: 'monthly' as const, price: 15, setup_fee: 0, min_contract_months: 0, cancellation_notice_days: 0, auto_renew: true, features: ['1 fresh towel per visit'], includes_classes: false, includes_sauna: false, includes_personal_training: 0, max_members: null, current_member_count: 34, is_active: true, is_popular: false, sort_order: 10, color: '#06B6D4', created_at: daysAgo(300), updated_at: daysAgo(1) },
  { id: 'plan-drinks', gym_id: 'demo-gym-id', name: 'Drinks Unlimited', description: 'Unlimited drinks (water, shakes, isotonic)', category: 'addon' as const, billing_interval: 'monthly' as const, price: 29, setup_fee: 0, min_contract_months: 0, cancellation_notice_days: 0, auto_renew: true, features: ['Unlimited Water', 'Protein Shakes', 'Isotonic Drinks'], includes_classes: false, includes_sauna: false, includes_personal_training: 0, max_members: null, current_member_count: 22, is_active: true, is_popular: false, sort_order: 11, color: '#10B981', created_at: daysAgo(300), updated_at: daysAgo(1) },
  { id: 'plan-pt5', gym_id: 'demo-gym-id', name: 'PT 5-Pack', description: '5 personal training sessions', category: 'addon' as const, billing_interval: 'monthly' as const, price: 450, setup_fee: 0, min_contract_months: 0, cancellation_notice_days: 0, auto_renew: false, features: ['5x 60min Personal Training', 'Training Plan', 'Progress Tracking'], includes_classes: false, includes_sauna: false, includes_personal_training: 5, max_members: null, current_member_count: 8, is_active: true, is_popular: false, sort_order: 12, color: '#F43F5E', created_at: daysAgo(300), updated_at: daysAgo(1) },
  { id: 'plan-pt10', gym_id: 'demo-gym-id', name: 'PT 10-Pack', description: '10 personal training sessions', category: 'addon' as const, billing_interval: 'monthly' as const, price: 800, setup_fee: 0, min_contract_months: 0, cancellation_notice_days: 0, auto_renew: false, features: ['10x 60min Personal Training', 'Training Plan', 'Nutrition Coaching', 'Progress Tracking'], includes_classes: false, includes_sauna: false, includes_personal_training: 10, max_members: null, current_member_count: 5, is_active: true, is_popular: false, sort_order: 13, color: '#E11D48', created_at: daysAgo(300), updated_at: daysAgo(1) },
  { id: 'plan-sauna', gym_id: 'demo-gym-id', name: 'Sauna Access', description: 'Unlimited sauna access', category: 'addon' as const, billing_interval: 'monthly' as const, price: 25, setup_fee: 0, min_contract_months: 0, cancellation_notice_days: 0, auto_renew: true, features: ['Unlimited Sauna Access', 'Towel Included'], includes_classes: false, includes_sauna: true, includes_personal_training: 0, max_members: null, current_member_count: 18, is_active: true, is_popular: false, sort_order: 14, color: '#D97706', created_at: daysAgo(300), updated_at: daysAgo(1) },
];

// ============================================================
// MEMBERSHIP CONTRACTS
// ============================================================

export const DEMO_MEMBERSHIP_CONTRACTS = [
  // Active contracts
  { id: 'contract-1', gym_id: 'demo-gym-id', member_id: 'm1', plan_id: 'plan-annual', contract_number: 'PRO-2503-0001', status: 'active' as const, start_date: dateStr(-365), end_date: dateStr(0), next_billing_date: dateStr(0), monthly_amount: 59, setup_fee_amount: 0, setup_fee_paid: true, discount_percent: 0, discount_reason: null, payment_method: 'direct_debit', stripe_subscription_id: null, auto_renew: true, cancelled_at: null, cancellation_type: null, cancellation_reason: null, cancellation_effective_date: null, cancellation_proof_url: null, cancelled_by: null, notes: null, created_at: daysAgo(365), updated_at: daysAgo(1), member: { id: 'm1', name: 'Emma Schneider', email: 'emma.schneider@outlook.com', avatar_url: null }, plan: { id: 'plan-annual', name: 'Annual Plan', category: 'main', billing_interval: 'annual', color: '#EAB308' } },
  { id: 'contract-2', gym_id: 'demo-gym-id', member_id: 'm2', plan_id: 'plan-premium', contract_number: 'PRO-2503-0002', status: 'active' as const, start_date: dateStr(-200), end_date: null, next_billing_date: dateStr(5), monthly_amount: 199, setup_fee_amount: 0, setup_fee_paid: true, discount_percent: 0, discount_reason: null, payment_method: 'card', stripe_subscription_id: null, auto_renew: true, cancelled_at: null, cancellation_type: null, cancellation_reason: null, cancellation_effective_date: null, cancellation_proof_url: null, cancelled_by: null, notes: 'VIP client, very satisfied', created_at: daysAgo(200), updated_at: daysAgo(1), member: { id: 'm2', name: 'Laura Zimmermann', email: 'laura.zimmermann@bluewin.ch', avatar_url: null }, plan: { id: 'plan-premium', name: 'Premium VIP', category: 'main', billing_interval: 'monthly', color: '#DC2626' } },
  { id: 'contract-3', gym_id: 'demo-gym-id', member_id: 'm3', plan_id: 'plan-annual', contract_number: 'PRO-2503-0003', status: 'active' as const, start_date: dateStr(-300), end_date: dateStr(65), next_billing_date: dateStr(65), monthly_amount: 59, setup_fee_amount: 0, setup_fee_paid: true, discount_percent: 10, discount_reason: 'Founding member', payment_method: 'direct_debit', stripe_subscription_id: null, auto_renew: true, cancelled_at: null, cancellation_type: null, cancellation_reason: null, cancellation_effective_date: null, cancellation_proof_url: null, cancelled_by: null, notes: null, created_at: daysAgo(300), updated_at: daysAgo(2), member: { id: 'm3', name: 'Thomas Brunner', email: 'thomas.brunner@gmail.com', avatar_url: null }, plan: { id: 'plan-annual', name: 'Annual Plan', category: 'main', billing_interval: 'annual', color: '#EAB308' } },
  { id: 'contract-4', gym_id: 'demo-gym-id', member_id: 'm5', plan_id: 'plan-3month', contract_number: 'PRO-2503-0004', status: 'active' as const, start_date: dateStr(-60), end_date: dateStr(30), next_billing_date: dateStr(30), monthly_amount: 79, setup_fee_amount: 49, setup_fee_paid: true, discount_percent: 0, discount_reason: null, payment_method: 'direct_debit', stripe_subscription_id: null, auto_renew: true, cancelled_at: null, cancellation_type: null, cancellation_reason: null, cancellation_effective_date: null, cancellation_proof_url: null, cancelled_by: null, notes: null, created_at: daysAgo(60), updated_at: daysAgo(5), member: { id: 'm5', name: 'Luca Müller', email: 'luca.mueller@gmail.com', avatar_url: null }, plan: { id: 'plan-3month', name: '3-Month Plan', category: 'main', billing_interval: 'quarterly', color: '#8B5CF6' } },
  { id: 'contract-5', gym_id: 'demo-gym-id', member_id: 'm6', plan_id: 'plan-6month', contract_number: 'PRO-2503-0005', status: 'active' as const, start_date: dateStr(-90), end_date: dateStr(90), next_billing_date: dateStr(90), monthly_amount: 69, setup_fee_amount: 0, setup_fee_paid: true, discount_percent: 0, discount_reason: null, payment_method: 'card', stripe_subscription_id: null, auto_renew: true, cancelled_at: null, cancellation_type: null, cancellation_reason: null, cancellation_effective_date: null, cancellation_proof_url: null, cancelled_by: null, notes: null, created_at: daysAgo(90), updated_at: daysAgo(3), member: { id: 'm6', name: 'Sofia Keller', email: 'sofia.keller@sunrise.ch', avatar_url: null }, plan: { id: 'plan-6month', name: '6-Month Plan', category: 'main', billing_interval: 'semi_annual', color: '#F97316' } },
  { id: 'contract-6', gym_id: 'demo-gym-id', member_id: 'm7', plan_id: 'plan-monthly', contract_number: 'PRO-2503-0006', status: 'active' as const, start_date: dateStr(-45), end_date: null, next_billing_date: dateStr(15), monthly_amount: 89, setup_fee_amount: 49, setup_fee_paid: true, discount_percent: 0, discount_reason: null, payment_method: 'direct_debit', stripe_subscription_id: null, auto_renew: true, cancelled_at: null, cancellation_type: null, cancellation_reason: null, cancellation_effective_date: null, cancellation_proof_url: null, cancelled_by: null, notes: null, created_at: daysAgo(45), updated_at: daysAgo(1), member: { id: 'm7', name: 'Mia Huber', email: 'mia.huber@gmail.com', avatar_url: null }, plan: { id: 'plan-monthly', name: 'Monthly', category: 'main', billing_interval: 'monthly', color: '#3B82F6' } },
  { id: 'contract-7', gym_id: 'demo-gym-id', member_id: 'm9', plan_id: 'plan-3month', contract_number: 'PRO-2503-0007', status: 'active' as const, start_date: dateStr(-30), end_date: dateStr(60), next_billing_date: dateStr(60), monthly_amount: 79, setup_fee_amount: 49, setup_fee_paid: true, discount_percent: 0, discount_reason: null, payment_method: 'paypal', stripe_subscription_id: null, auto_renew: true, cancelled_at: null, cancellation_type: null, cancellation_reason: null, cancellation_effective_date: null, cancellation_proof_url: null, cancelled_by: null, notes: null, created_at: daysAgo(30), updated_at: daysAgo(2), member: { id: 'm9', name: 'Lea Bachmann', email: 'lea.bachmann@protonmail.com', avatar_url: null }, plan: { id: 'plan-3month', name: '3-Month Plan', category: 'main', billing_interval: 'quarterly', color: '#8B5CF6' } },
  // Frozen contract
  { id: 'contract-8', gym_id: 'demo-gym-id', member_id: 'm8', plan_id: 'plan-6month', contract_number: 'PRO-2503-0008', status: 'frozen' as const, start_date: dateStr(-120), end_date: dateStr(90), next_billing_date: null, monthly_amount: 69, setup_fee_amount: 0, setup_fee_paid: true, discount_percent: 0, discount_reason: null, payment_method: 'direct_debit', stripe_subscription_id: null, auto_renew: true, cancelled_at: null, cancellation_type: null, cancellation_reason: null, cancellation_effective_date: null, cancellation_proof_url: null, cancelled_by: null, notes: 'Knee surgery, freeze approved', created_at: daysAgo(120), updated_at: daysAgo(10), member: { id: 'm8', name: 'David Steiner', email: 'david.steiner@sunrise.ch', avatar_url: null }, plan: { id: 'plan-6month', name: '6-Month Plan', category: 'main', billing_interval: 'semi_annual', color: '#F97316' } },
  // Cancelled contracts
  { id: 'contract-9', gym_id: 'demo-gym-id', member_id: 'm18', plan_id: 'plan-monthly', contract_number: 'PRO-2503-0009', status: 'cancelled' as const, start_date: dateStr(-90), end_date: dateStr(-30), next_billing_date: null, monthly_amount: 89, setup_fee_amount: 49, setup_fee_paid: true, discount_percent: 0, discount_reason: null, payment_method: 'direct_debit', stripe_subscription_id: null, auto_renew: false, cancelled_at: daysAgo(45), cancellation_type: 'regular' as const, cancellation_reason: 'Relocating to another city', cancellation_effective_date: dateStr(-30), cancellation_proof_url: null, cancelled_by: 'Admin', notes: null, created_at: daysAgo(90), updated_at: daysAgo(30), member: { id: 'm18', name: 'Elias Brunner', email: 'elias.brunner@outlook.com', avatar_url: null }, plan: { id: 'plan-monthly', name: 'Monthly', category: 'main', billing_interval: 'monthly', color: '#3B82F6' } },
  { id: 'contract-10', gym_id: 'demo-gym-id', member_id: 'm21', plan_id: 'plan-3month', contract_number: 'PRO-2503-0010', status: 'cancelled' as const, start_date: dateStr(-100), end_date: dateStr(-10), next_billing_date: null, monthly_amount: 79, setup_fee_amount: 49, setup_fee_paid: true, discount_percent: 0, discount_reason: null, payment_method: 'card', stripe_subscription_id: null, auto_renew: false, cancelled_at: daysAgo(40), cancellation_type: 'extraordinary' as const, cancellation_reason: 'Medical certificate - herniated disc', cancellation_effective_date: dateStr(-10), cancellation_proof_url: null, cancelled_by: 'Admin', notes: 'Extraordinary cancellation with medical certificate', created_at: daysAgo(100), updated_at: daysAgo(10), member: { id: 'm21', name: 'Melanie Suter', email: 'melanie.suter@outlook.com', avatar_url: null }, plan: { id: 'plan-3month', name: '3-Month Plan', category: 'main', billing_interval: 'quarterly', color: '#8B5CF6' } },
  // Expiring soon
  { id: 'contract-11', gym_id: 'demo-gym-id', member_id: 'm14', plan_id: 'plan-6month', contract_number: 'PRO-2503-0011', status: 'active' as const, start_date: dateStr(-170), end_date: dateStr(10), next_billing_date: dateStr(10), monthly_amount: 69, setup_fee_amount: 0, setup_fee_paid: true, discount_percent: 5, discount_reason: 'Referral', payment_method: 'direct_debit', stripe_subscription_id: null, auto_renew: false, cancelled_at: null, cancellation_type: null, cancellation_reason: null, cancellation_effective_date: null, cancellation_proof_url: null, cancelled_by: null, notes: 'Expires in 10 days, no auto-renew!', created_at: daysAgo(170), updated_at: daysAgo(5), member: { id: 'm14', name: 'Julia Frei', email: 'julia.frei@protonmail.com', avatar_url: null }, plan: { id: 'plan-6month', name: '6-Month Plan', category: 'main', billing_interval: 'semi_annual', color: '#F97316' } },
  { id: 'contract-12', gym_id: 'demo-gym-id', member_id: 'm19', plan_id: 'plan-monthly', contract_number: 'PRO-2503-0012', status: 'active' as const, start_date: dateStr(-25), end_date: dateStr(5), next_billing_date: dateStr(5), monthly_amount: 89, setup_fee_amount: 49, setup_fee_paid: true, discount_percent: 0, discount_reason: null, payment_method: 'card', stripe_subscription_id: null, auto_renew: true, cancelled_at: null, cancellation_type: null, cancellation_reason: null, cancellation_effective_date: null, cancellation_proof_url: null, cancelled_by: null, notes: null, created_at: daysAgo(25), updated_at: daysAgo(1), member: { id: 'm19', name: 'Anna Gerber', email: 'anna.gerber@protonmail.com', avatar_url: null }, plan: { id: 'plan-monthly', name: 'Monthly', category: 'main', billing_interval: 'monthly', color: '#3B82F6' } },
];

// ============================================================
// MEMBERSHIP ADDONS
// ============================================================

export const DEMO_MEMBERSHIP_ADDONS = [
  { id: 'addon-1', gym_id: 'demo-gym-id', member_id: 'm1', contract_id: 'contract-1', plan_id: 'plan-towel', status: 'active' as const, start_date: dateStr(-365), end_date: null, monthly_amount: 15, notes: null, created_at: daysAgo(365), updated_at: daysAgo(1), member: { id: 'm1', name: 'Emma Schneider', email: 'emma.schneider@outlook.com' }, plan: { id: 'plan-towel', name: 'Towel Service', price: 15, color: '#06B6D4' } },
  { id: 'addon-2', gym_id: 'demo-gym-id', member_id: 'm1', contract_id: 'contract-1', plan_id: 'plan-drinks', status: 'active' as const, start_date: dateStr(-365), end_date: null, monthly_amount: 29, notes: null, created_at: daysAgo(365), updated_at: daysAgo(1), member: { id: 'm1', name: 'Emma Schneider', email: 'emma.schneider@outlook.com' }, plan: { id: 'plan-drinks', name: 'Drinks Unlimited', price: 29, color: '#10B981' } },
  { id: 'addon-3', gym_id: 'demo-gym-id', member_id: 'm2', contract_id: 'contract-2', plan_id: 'plan-towel', status: 'active' as const, start_date: dateStr(-200), end_date: null, monthly_amount: 15, notes: null, created_at: daysAgo(200), updated_at: daysAgo(1), member: { id: 'm2', name: 'Laura Zimmermann', email: 'laura.zimmermann@bluewin.ch' }, plan: { id: 'plan-towel', name: 'Towel Service', price: 15, color: '#06B6D4' } },
  { id: 'addon-4', gym_id: 'demo-gym-id', member_id: 'm3', contract_id: 'contract-3', plan_id: 'plan-pt5', status: 'active' as const, start_date: dateStr(-30), end_date: null, monthly_amount: 450, notes: '3 of 5 sessions used', created_at: daysAgo(30), updated_at: daysAgo(3), member: { id: 'm3', name: 'Thomas Brunner', email: 'thomas.brunner@gmail.com' }, plan: { id: 'plan-pt5', name: 'PT 5-Pack', price: 450, color: '#F43F5E' } },
  { id: 'addon-5', gym_id: 'demo-gym-id', member_id: 'm5', contract_id: 'contract-4', plan_id: 'plan-drinks', status: 'active' as const, start_date: dateStr(-60), end_date: null, monthly_amount: 29, notes: null, created_at: daysAgo(60), updated_at: daysAgo(1), member: { id: 'm5', name: 'Luca Müller', email: 'luca.mueller@gmail.com' }, plan: { id: 'plan-drinks', name: 'Drinks Unlimited', price: 29, color: '#10B981' } },
  { id: 'addon-6', gym_id: 'demo-gym-id', member_id: 'm6', contract_id: 'contract-5', plan_id: 'plan-sauna', status: 'active' as const, start_date: dateStr(-90), end_date: null, monthly_amount: 25, notes: null, created_at: daysAgo(90), updated_at: daysAgo(1), member: { id: 'm6', name: 'Sofia Keller', email: 'sofia.keller@sunrise.ch' }, plan: { id: 'plan-sauna', name: 'Sauna Access', price: 25, color: '#D97706' } },
];

// ============================================================
// MEMBERSHIP FREEZES (Timestop)
// ============================================================

export const DEMO_MEMBERSHIP_FREEZES = [
  // Active freeze
  { id: 'freeze-1', gym_id: 'demo-gym-id', member_id: 'm8', contract_id: 'contract-8', reason: 'injury' as const, reason_detail: 'Knee surgery, 6 weeks rehab', start_date: dateStr(-14), end_date: dateStr(28), original_contract_end: dateStr(48), extended_contract_end: dateStr(90), proof_document_url: null, proof_type: 'medical_certificate', status: 'approved' as const, approved_by: 'Daniel P.', approved_at: daysAgo(15), rejected_reason: null, notes: 'Medical certificate on file', created_at: daysAgo(16), updated_at: daysAgo(14), member: { id: 'm8', name: 'David Steiner', email: 'david.steiner@sunrise.ch', avatar_url: null }, contract: { id: 'contract-8', contract_number: 'PRO-2503-0008' } },
  // Pending freeze request
  { id: 'freeze-2', gym_id: 'demo-gym-id', member_id: 'm13', contract_id: 'contract-4', reason: 'military' as const, reason_detail: 'Swiss Army refresher course, 3 weeks', start_date: dateStr(14), end_date: dateStr(35), original_contract_end: null, extended_contract_end: null, proof_document_url: null, proof_type: 'military_order', status: 'pending' as const, approved_by: null, approved_at: null, rejected_reason: null, notes: 'Military order to be submitted', created_at: daysAgo(2), updated_at: daysAgo(2), member: { id: 'm13', name: 'Patrick Wyss', email: 'patrick.wyss@sunrise.ch', avatar_url: null }, contract: { id: 'contract-4', contract_number: 'PRO-2503-0004' } },
  // Past freeze (ended)
  { id: 'freeze-3', gym_id: 'demo-gym-id', member_id: 'm4', contract_id: 'contract-3', reason: 'pregnancy' as const, reason_detail: 'Pregnancy from 7th month', start_date: dateStr(-120), end_date: dateStr(-30), original_contract_end: dateStr(-60), extended_contract_end: dateStr(30), proof_document_url: null, proof_type: 'medical_certificate', status: 'ended' as const, approved_by: 'Daniel P.', approved_at: daysAgo(125), rejected_reason: null, notes: 'Everything went well, member active again', created_at: daysAgo(130), updated_at: daysAgo(30), member: { id: 'm4', name: 'Nina Hartmann', email: 'nina.hartmann@sunrise.ch', avatar_url: null }, contract: { id: 'contract-3', contract_number: 'PRO-2503-0003' } },
];

// ============================================================
// MEMBER WARNINGS
// ============================================================

export const DEMO_MEMBER_WARNINGS = [
  { id: 'warn-1', gym_id: 'demo-gym-id', member_id: 'm11', warning_level: '1' as const, reason: 'Repeatedly not reracking weights', description: 'Despite multiple verbal reminders, the member continues to leave weights and equipment unracked. Written warning issued.', issued_by: 'Marco Bianchi', issued_at: daysAgo(14), expires_at: daysAgo(-76), is_active: true, acknowledged_at: daysAgo(13), created_at: daysAgo(14), updated_at: daysAgo(13), member: { id: 'm11', name: 'Tim Gerber', email: 'tim.gerber@gmail.com', avatar_url: null } },
  { id: 'warn-2', gym_id: 'demo-gym-id', member_id: 'm24', warning_level: '2' as const, reason: 'Aggressive behavior toward coach', description: 'Member verbally abused Coach Luca Schneider after being corrected on exercise form. Second warning issued.', issued_by: 'Daniel P.', issued_at: daysAgo(7), expires_at: daysAgo(-83), is_active: true, acknowledged_at: null, created_at: daysAgo(7), updated_at: daysAgo(7), member: { id: 'm24', name: 'Dominik Hofmann', email: 'dominik.hofmann@protonmail.com', avatar_url: null } },
  { id: 'warn-3', gym_id: 'demo-gym-id', member_id: 'm24', warning_level: '1' as const, reason: 'Playing loud music without headphones', description: 'Member repeatedly played music on speakers in the training area.', issued_by: 'Sofia Meier', issued_at: daysAgo(30), expires_at: daysAgo(-60), is_active: true, acknowledged_at: daysAgo(29), created_at: daysAgo(30), updated_at: daysAgo(29), member: { id: 'm24', name: 'Dominik Hofmann', email: 'dominik.hofmann@protonmail.com', avatar_url: null } },
];

// ============================================================
// MEMBER BANS
// ============================================================

export const DEMO_MEMBER_BANS = [
  { id: 'ban-1', gym_id: 'demo-gym-id', member_id: 'm24', ban_type: 'temporary' as const, reason: 'Escalation after 2nd warning', description: 'Following the second warning for aggressive behavior, a 2-week suspension has been imposed. Any further incident will result in permanent expulsion.', start_date: dateStr(-5), end_date: dateStr(9), issued_by: 'Daniel P.', issued_at: daysAgo(5), is_active: true, lifted_at: null, lifted_by: null, lift_reason: null, created_at: daysAgo(5), updated_at: daysAgo(5), member: { id: 'm24', name: 'Dominik Hofmann', email: 'dominik.hofmann@protonmail.com', avatar_url: null } },
];

// ============================================================
// MEMBERSHIP STATS
// ============================================================

export const DEMO_MEMBERSHIP_STATS = {
  totalContracts: 12,
  activeContracts: 9,
  frozenContracts: 1,
  cancelledContracts: 2,
  mrr: 8943,
  avgContractValue: 83.50,
};

// ============================================================
// COACH DETAIL DATA (response times, service index, activity)
// ============================================================

function weeksAgoLabel(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n * 7);
  return `${d.getDate()}.${d.getMonth() + 1}`;
}

function recentMonthLabels(count: number): string[] {
  const labels: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleString('de-CH', { month: 'short' }));
  }
  return labels;
}

const _months = recentMonthLabels(6);

export const DEMO_COACH_RESPONSE_METRICS: Record<string, CoachResponseMetrics> = {
  c1: { coachId: 'c1', avgResponseMinutes: 18, medianResponseMinutes: 12, responseRate: 0.97, totalMessagesReceived: 214, totalMessagesReplied: 208, weeklyTrend: [{ week: weeksAgoLabel(7), avgMinutes: 22 }, { week: weeksAgoLabel(6), avgMinutes: 20 }, { week: weeksAgoLabel(5), avgMinutes: 19 }, { week: weeksAgoLabel(4), avgMinutes: 17 }, { week: weeksAgoLabel(3), avgMinutes: 16 }, { week: weeksAgoLabel(2), avgMinutes: 18 }, { week: weeksAgoLabel(1), avgMinutes: 15 }, { week: weeksAgoLabel(0), avgMinutes: 14 }] },
  c2: { coachId: 'c2', avgResponseMinutes: 12, medianResponseMinutes: 8, responseRate: 0.99, totalMessagesReceived: 312, totalMessagesReplied: 309, weeklyTrend: [{ week: weeksAgoLabel(7), avgMinutes: 15 }, { week: weeksAgoLabel(6), avgMinutes: 13 }, { week: weeksAgoLabel(5), avgMinutes: 11 }, { week: weeksAgoLabel(4), avgMinutes: 12 }, { week: weeksAgoLabel(3), avgMinutes: 10 }, { week: weeksAgoLabel(2), avgMinutes: 11 }, { week: weeksAgoLabel(1), avgMinutes: 9 }, { week: weeksAgoLabel(0), avgMinutes: 8 }] },
  c3: { coachId: 'c3', avgResponseMinutes: 85, medianResponseMinutes: 62, responseRate: 0.78, totalMessagesReceived: 156, totalMessagesReplied: 122, weeklyTrend: [{ week: weeksAgoLabel(7), avgMinutes: 45 }, { week: weeksAgoLabel(6), avgMinutes: 55 }, { week: weeksAgoLabel(5), avgMinutes: 68 }, { week: weeksAgoLabel(4), avgMinutes: 72 }, { week: weeksAgoLabel(3), avgMinutes: 90 }, { week: weeksAgoLabel(2), avgMinutes: 95 }, { week: weeksAgoLabel(1), avgMinutes: 105 }, { week: weeksAgoLabel(0), avgMinutes: 112 }] },
  c4: { coachId: 'c4', avgResponseMinutes: 25, medianResponseMinutes: 18, responseRate: 0.94, totalMessagesReceived: 198, totalMessagesReplied: 186, weeklyTrend: [{ week: weeksAgoLabel(7), avgMinutes: 30 }, { week: weeksAgoLabel(6), avgMinutes: 28 }, { week: weeksAgoLabel(5), avgMinutes: 26 }, { week: weeksAgoLabel(4), avgMinutes: 24 }, { week: weeksAgoLabel(3), avgMinutes: 22 }, { week: weeksAgoLabel(2), avgMinutes: 25 }, { week: weeksAgoLabel(1), avgMinutes: 23 }, { week: weeksAgoLabel(0), avgMinutes: 20 }] },
  c5: { coachId: 'c5', avgResponseMinutes: 45, medianResponseMinutes: 35, responseRate: 0.82, totalMessagesReceived: 134, totalMessagesReplied: 110, weeklyTrend: [{ week: weeksAgoLabel(7), avgMinutes: 50 }, { week: weeksAgoLabel(6), avgMinutes: 48 }, { week: weeksAgoLabel(5), avgMinutes: 42 }, { week: weeksAgoLabel(4), avgMinutes: 44 }, { week: weeksAgoLabel(3), avgMinutes: 40 }, { week: weeksAgoLabel(2), avgMinutes: 46 }, { week: weeksAgoLabel(1), avgMinutes: 43 }, { week: weeksAgoLabel(0), avgMinutes: 38 }] },
  c6: { coachId: 'c6', avgResponseMinutes: 0, medianResponseMinutes: 0, responseRate: 0, totalMessagesReceived: 0, totalMessagesReplied: 0, weeklyTrend: [] },
  c7: { coachId: 'c7', avgResponseMinutes: 15, medianResponseMinutes: 10, responseRate: 0.98, totalMessagesReceived: 287, totalMessagesReplied: 281, weeklyTrend: [{ week: weeksAgoLabel(7), avgMinutes: 18 }, { week: weeksAgoLabel(6), avgMinutes: 16 }, { week: weeksAgoLabel(5), avgMinutes: 15 }, { week: weeksAgoLabel(4), avgMinutes: 14 }, { week: weeksAgoLabel(3), avgMinutes: 13 }, { week: weeksAgoLabel(2), avgMinutes: 15 }, { week: weeksAgoLabel(1), avgMinutes: 12 }, { week: weeksAgoLabel(0), avgMinutes: 11 }] },
};

export const DEMO_COACH_SERVICE_INDEX: Record<string, CoachServiceIndex> = {
  c1: {
    coachId: 'c1', overallScore: 92, npsScore: 78, clientRetentionRate: 94, avgClientTenureMonths: 11,
    monthlyScores: [{ month: _months[0], score: 88 }, { month: _months[1], score: 89 }, { month: _months[2], score: 91 }, { month: _months[3], score: 90 }, { month: _months[4], score: 93 }, { month: _months[5], score: 92 }],
    clients: [
      { clientId: 'cc-1', clientName: 'Luca Müller', email: 'luca.mueller@gmail.com', satisfactionScore: 9, retentionMonths: 6, sessionsCompleted: 48, sessionsNoShow: 1, progressRating: 5, lastFeedback: 'Bester Trainer, den ich je hatte!', lastMessageAt: hoursAgo(3), avgResponseMinutes: 12, trend: 'improving' },
      { clientId: 'cc-2', clientName: 'Laura Zimmermann', email: 'laura.zimmermann@bluewin.ch', satisfactionScore: 10, retentionMonths: 13, sessionsCompleted: 104, sessionsNoShow: 2, progressRating: 5, lastFeedback: 'Marco pusht mich immer aufs nächste Level.', lastMessageAt: hoursAgo(8), avgResponseMinutes: 15, trend: 'stable' },
      { clientId: 'cc-3', clientName: 'Thomas Brunner', email: 'thomas.brunner@gmail.com', satisfactionScore: 8, retentionMonths: 16, sessionsCompleted: 128, sessionsNoShow: 5, progressRating: 4, lastFeedback: null, lastMessageAt: daysAgo(1), avgResponseMinutes: 22, trend: 'stable' },
    ],
  },
  c2: {
    coachId: 'c2', overallScore: 96, npsScore: 85, clientRetentionRate: 97, avgClientTenureMonths: 9,
    monthlyScores: [{ month: _months[0], score: 93 }, { month: _months[1], score: 94 }, { month: _months[2], score: 95 }, { month: _months[3], score: 96 }, { month: _months[4], score: 95 }, { month: _months[5], score: 96 }],
    clients: [
      { clientId: 'cc-4', clientName: 'Emma Schneider', email: 'emma.schneider@outlook.com', satisfactionScore: 10, retentionMonths: 12, sessionsCompleted: 96, sessionsNoShow: 0, progressRating: 5, lastFeedback: 'Sofia versteht genau was ich brauche.', lastMessageAt: hoursAgo(2), avgResponseMinutes: 8, trend: 'improving' },
      { clientId: 'cc-5', clientName: 'Lea Bachmann', email: 'lea.bachmann@protonmail.com', satisfactionScore: 9, retentionMonths: 5, sessionsCompleted: 40, sessionsNoShow: 1, progressRating: 5, lastFeedback: 'Ernährungscoaching ist top!', lastMessageAt: hoursAgo(1), avgResponseMinutes: 10, trend: 'improving' },
      { clientId: 'cc-6', clientName: 'Céline Meier', email: 'celine.meier@gmail.com', satisfactionScore: 9, retentionMonths: 5, sessionsCompleted: 38, sessionsNoShow: 2, progressRating: 4, lastFeedback: null, lastMessageAt: hoursAgo(6), avgResponseMinutes: 14, trend: 'stable' },
    ],
  },
  c3: {
    coachId: 'c3', overallScore: 61, npsScore: 22, clientRetentionRate: 68, avgClientTenureMonths: 5,
    monthlyScores: [{ month: _months[0], score: 75 }, { month: _months[1], score: 72 }, { month: _months[2], score: 68 }, { month: _months[3], score: 65 }, { month: _months[4], score: 63 }, { month: _months[5], score: 61 }],
    clients: [
      { clientId: 'lc-1', clientName: 'Fabian Kuster', email: 'fabian.kuster@gmail.com', satisfactionScore: 6, retentionMonths: 8, sessionsCompleted: 52, sessionsNoShow: 8, progressRating: 3, lastFeedback: 'Antwortet oft erst nach Stunden...', lastMessageAt: daysAgo(2), avgResponseMinutes: 95, trend: 'declining' },
      { clientId: 'lc-2', clientName: 'Sandra Widmer', email: 'sandra.widmer@bluewin.ch', satisfactionScore: 7, retentionMonths: 4, sessionsCompleted: 28, sessionsNoShow: 3, progressRating: 3, lastFeedback: 'Training ist gut, Kommunikation könnte besser sein.', lastMessageAt: daysAgo(3), avgResponseMinutes: 78, trend: 'declining' },
      { clientId: 'lc-3', clientName: 'Dominik Erb', email: 'dominik.erb@sunrise.ch', satisfactionScore: 5, retentionMonths: 3, sessionsCompleted: 18, sessionsNoShow: 5, progressRating: 2, lastFeedback: 'Zu viele No-Shows, fühle mich nicht ernst genommen.', lastMessageAt: daysAgo(5), avgResponseMinutes: 120, trend: 'declining' },
    ],
  },
  c4: {
    coachId: 'c4', overallScore: 89, npsScore: 72, clientRetentionRate: 91, avgClientTenureMonths: 8,
    monthlyScores: [{ month: _months[0], score: 85 }, { month: _months[1], score: 86 }, { month: _months[2], score: 87 }, { month: _months[3], score: 88 }, { month: _months[4], score: 89 }, { month: _months[5], score: 89 }],
    clients: [
      { clientId: 'cc-7', clientName: 'Sofia Keller', email: 'sofia.keller@sunrise.ch', satisfactionScore: 9, retentionMonths: 4, sessionsCompleted: 32, sessionsNoShow: 0, progressRating: 5, lastFeedback: 'Elena ist fantastisch, sehr einfühlsam.', lastMessageAt: hoursAgo(5), avgResponseMinutes: 20, trend: 'improving' },
      { clientId: 'cc-8', clientName: 'Nina Hartmann', email: 'nina.hartmann@sunrise.ch', satisfactionScore: 8, retentionMonths: 7, sessionsCompleted: 52, sessionsNoShow: 3, progressRating: 4, lastFeedback: null, lastMessageAt: daysAgo(2), avgResponseMinutes: 28, trend: 'stable' },
      { clientId: 'cc-9', clientName: 'Julia Frei', email: 'julia.frei@protonmail.com', satisfactionScore: 9, retentionMonths: 6, sessionsCompleted: 44, sessionsNoShow: 1, progressRating: 4, lastFeedback: 'Meine Mobility hat sich unglaublich verbessert.', lastMessageAt: hoursAgo(10), avgResponseMinutes: 25, trend: 'improving' },
    ],
  },
  c5: {
    coachId: 'c5', overallScore: 74, npsScore: 45, clientRetentionRate: 79, avgClientTenureMonths: 6,
    monthlyScores: [{ month: _months[0], score: 70 }, { month: _months[1], score: 71 }, { month: _months[2], score: 72 }, { month: _months[3], score: 73 }, { month: _months[4], score: 75 }, { month: _months[5], score: 74 }],
    clients: [
      { clientId: 'nk-1', clientName: 'Adrian Blum', email: 'adrian.blum@gmail.com', satisfactionScore: 8, retentionMonths: 10, sessionsCompleted: 72, sessionsNoShow: 4, progressRating: 4, lastFeedback: 'Guter Trainer, aber manchmal schwer erreichbar.', lastMessageAt: daysAgo(1), avgResponseMinutes: 40, trend: 'stable' },
      { clientId: 'nk-2', clientName: 'Ramon Schweizer', email: 'ramon.schweizer@protonmail.com', satisfactionScore: 7, retentionMonths: 5, sessionsCompleted: 36, sessionsNoShow: 2, progressRating: 3, lastFeedback: null, lastMessageAt: daysAgo(2), avgResponseMinutes: 52, trend: 'stable' },
    ],
  },
  c6: {
    coachId: 'c6', overallScore: 0, npsScore: 0, clientRetentionRate: 0, avgClientTenureMonths: 0,
    monthlyScores: [],
    clients: [],
  },
  c7: {
    coachId: 'c7', overallScore: 94, npsScore: 82, clientRetentionRate: 96, avgClientTenureMonths: 7,
    monthlyScores: [{ month: _months[0], score: 90 }, { month: _months[1], score: 91 }, { month: _months[2], score: 92 }, { month: _months[3], score: 93 }, { month: _months[4], score: 94 }, { month: _months[5], score: 94 }],
    clients: [
      { clientId: 'cc-10', clientName: 'Raphael Ammann', email: 'raphael.ammann@bluewin.ch', satisfactionScore: 10, retentionMonths: 11, sessionsCompleted: 88, sessionsNoShow: 1, progressRating: 5, lastFeedback: 'Daniele ist der Grund warum ich noch trainiere.', lastMessageAt: hoursAgo(2), avgResponseMinutes: 8, trend: 'improving' },
      { clientId: 'cc-11', clientName: 'Fabienne Gerber', email: 'fabienne.gerber@gmail.com', satisfactionScore: 10, retentionMonths: 9, sessionsCompleted: 72, sessionsNoShow: 0, progressRating: 5, lastFeedback: 'Bester Coach in Zürich, Punkt.', lastMessageAt: hoursAgo(1), avgResponseMinutes: 6, trend: 'improving' },
      { clientId: 'cc-12', clientName: 'Marco Wyss', email: 'marco.wyss@protonmail.com', satisfactionScore: 9, retentionMonths: 8, sessionsCompleted: 64, sessionsNoShow: 2, progressRating: 5, lastFeedback: 'Meine Kraftwerte sind explodiert.', lastMessageAt: hoursAgo(4), avgResponseMinutes: 12, trend: 'improving' },
      { clientId: 'cc-13', clientName: 'Janine Bühler', email: 'janine.buehler@sunrise.ch', satisfactionScore: 9, retentionMonths: 6, sessionsCompleted: 48, sessionsNoShow: 1, progressRating: 4, lastFeedback: 'Sehr professionell und motivierend.', lastMessageAt: hoursAgo(6), avgResponseMinutes: 15, trend: 'stable' },
      { clientId: 'cc-14', clientName: 'Patrick Lehmann', email: 'patrick.lehmann@outlook.com', satisfactionScore: 8, retentionMonths: 5, sessionsCompleted: 38, sessionsNoShow: 3, progressRating: 4, lastFeedback: null, lastMessageAt: daysAgo(1), avgResponseMinutes: 18, trend: 'stable' },
      { clientId: 'cc-15', clientName: 'Selina Roth', email: 'selina.roth@gmail.com', satisfactionScore: 10, retentionMonths: 4, sessionsCompleted: 34, sessionsNoShow: 0, progressRating: 5, lastFeedback: 'Ernährungsberatung hat alles verändert!', lastMessageAt: hoursAgo(3), avgResponseMinutes: 10, trend: 'improving' },
      { clientId: 'cc-16', clientName: 'Tim Baumann', email: 'tim.baumann@bluewin.ch', satisfactionScore: 8, retentionMonths: 3, sessionsCompleted: 24, sessionsNoShow: 2, progressRating: 4, lastFeedback: null, lastMessageAt: daysAgo(2), avgResponseMinutes: 20, trend: 'stable' },
      { clientId: 'cc-17', clientName: 'Noemi Sutter', email: 'noemi.sutter@gmail.com', satisfactionScore: 9, retentionMonths: 3, sessionsCompleted: 22, sessionsNoShow: 0, progressRating: 5, lastFeedback: 'Fühle mich so gut wie nie!', lastMessageAt: hoursAgo(5), avgResponseMinutes: 14, trend: 'improving' },
      { clientId: 'cc-18', clientName: 'Nico Walther', email: 'nico.walther@protonmail.com', satisfactionScore: 9, retentionMonths: 2, sessionsCompleted: 16, sessionsNoShow: 1, progressRating: 4, lastFeedback: 'Top Coaching, sehr individuell.', lastMessageAt: hoursAgo(8), avgResponseMinutes: 16, trend: 'improving' },
      { clientId: 'cc-19', clientName: 'Alina Fehr', email: 'alina.fehr@sunrise.ch', satisfactionScore: 10, retentionMonths: 2, sessionsCompleted: 14, sessionsNoShow: 0, progressRating: 5, lastFeedback: 'Daniele nimmt sich wirklich Zeit.', lastMessageAt: hoursAgo(1), avgResponseMinutes: 9, trend: 'improving' },
      { clientId: 'cc-20', clientName: 'Yannick Moser', email: 'yannick.moser@outlook.com', satisfactionScore: 7, retentionMonths: 1, sessionsCompleted: 8, sessionsNoShow: 2, progressRating: 3, lastFeedback: null, lastMessageAt: daysAgo(3), avgResponseMinutes: 22, trend: 'stable' },
      { clientId: 'cc-21', clientName: 'Lena Bosshard', email: 'lena.bosshard@gmail.com', satisfactionScore: 9, retentionMonths: 1, sessionsCompleted: 7, sessionsNoShow: 0, progressRating: 4, lastFeedback: 'Bin begeistert, endlich ein Coach der zuhört.', lastMessageAt: hoursAgo(4), avgResponseMinutes: 11, trend: 'improving' },
      { clientId: 'cc-22', clientName: 'Sven Dietrich', email: 'sven.dietrich@bluewin.ch', satisfactionScore: 8, retentionMonths: 1, sessionsCompleted: 5, sessionsNoShow: 1, progressRating: 3, lastFeedback: null, lastMessageAt: daysAgo(1), avgResponseMinutes: 19, trend: 'stable' },
      { clientId: 'cc-23', clientName: 'Chiara Volpe', email: 'chiara.volpe@gmail.com', satisfactionScore: 10, retentionMonths: 0, sessionsCompleted: 4, sessionsNoShow: 0, progressRating: 5, lastFeedback: 'Wow, so ein professionelles Onboarding!', lastMessageAt: hoursAgo(2), avgResponseMinutes: 7, trend: 'improving' },
    ],
  },
};

export const DEMO_COACH_ACTIVITY: Record<string, CoachActivityEvent[]> = {
  c1: [
    { id: 'act-1a', type: 'session_completed', description: 'Session mit Luca Müller abgeschlossen', timestamp: hoursAgo(3), relatedClientName: 'Luca Müller' },
    { id: 'act-1b', type: 'message_sent', description: 'Trainingsfeedback an Laura Zimmermann gesendet', timestamp: hoursAgo(5), relatedClientName: 'Laura Zimmermann' },
    { id: 'act-1c', type: 'workout_created', description: 'Neues Workout "EMOM Destroyer" erstellt', timestamp: hoursAgo(8) },
    { id: 'act-1d', type: 'session_completed', description: 'Session mit Thomas Brunner abgeschlossen', timestamp: daysAgo(1), relatedClientName: 'Thomas Brunner' },
    { id: 'act-1e', type: 'feedback_received', description: 'Neue 5-Sterne Bewertung von Laura Zimmermann', timestamp: daysAgo(1), relatedClientName: 'Laura Zimmermann' },
    { id: 'act-1f', type: 'program_assigned', description: 'Programm "12-Week Strength" an neuen Kunden zugewiesen', timestamp: daysAgo(2) },
  ],
  c2: [
    { id: 'act-2a', type: 'message_sent', description: 'Meal Plan an Emma Schneider gesendet', timestamp: hoursAgo(1), relatedClientName: 'Emma Schneider' },
    { id: 'act-2b', type: 'session_completed', description: 'Session mit Lea Bachmann abgeschlossen', timestamp: hoursAgo(4), relatedClientName: 'Lea Bachmann' },
    { id: 'act-2c', type: 'client_onboarded', description: 'Neue Kundin Céline Meier ongeboardet', timestamp: hoursAgo(6), relatedClientName: 'Céline Meier' },
    { id: 'act-2d', type: 'feedback_received', description: 'Neue 5-Sterne Bewertung von Emma Schneider', timestamp: daysAgo(1), relatedClientName: 'Emma Schneider' },
    { id: 'act-2e', type: 'workout_created', description: 'Neues Workout "Core Blaster" erstellt', timestamp: daysAgo(1) },
    { id: 'act-2f', type: 'session_completed', description: 'Gruppensession "Body Transform" abgeschlossen', timestamp: daysAgo(2) },
  ],
  c3: [
    { id: 'act-3a', type: 'no_show', description: 'Dominik Erb nicht zur Session erschienen', timestamp: daysAgo(1), relatedClientName: 'Dominik Erb' },
    { id: 'act-3b', type: 'session_completed', description: 'Session mit Sandra Widmer abgeschlossen', timestamp: daysAgo(2), relatedClientName: 'Sandra Widmer' },
    { id: 'act-3c', type: 'no_show', description: 'Fabian Kuster nicht zur Session erschienen', timestamp: daysAgo(3), relatedClientName: 'Fabian Kuster' },
    { id: 'act-3d', type: 'message_sent', description: 'Antwort an Fabian Kuster (nach 2h 15min)', timestamp: daysAgo(3), relatedClientName: 'Fabian Kuster' },
    { id: 'act-3e', type: 'session_completed', description: 'Session mit Dominik Erb abgeschlossen', timestamp: daysAgo(5), relatedClientName: 'Dominik Erb' },
  ],
  c4: [
    { id: 'act-4a', type: 'session_completed', description: 'Yoga-Session mit Sofia Keller abgeschlossen', timestamp: hoursAgo(5), relatedClientName: 'Sofia Keller' },
    { id: 'act-4b', type: 'message_sent', description: 'Mobility-Tipps an Julia Frei gesendet', timestamp: hoursAgo(8), relatedClientName: 'Julia Frei' },
    { id: 'act-4c', type: 'workout_created', description: 'Neues Workout "Morning Flow" erstellt', timestamp: daysAgo(1) },
    { id: 'act-4d', type: 'session_completed', description: 'Pilates-Gruppensession abgeschlossen', timestamp: daysAgo(1) },
    { id: 'act-4e', type: 'feedback_received', description: 'Neue Bewertung von Sofia Keller', timestamp: daysAgo(2), relatedClientName: 'Sofia Keller' },
  ],
  c5: [
    { id: 'act-5a', type: 'session_completed', description: 'Session mit Adrian Blum abgeschlossen', timestamp: daysAgo(1), relatedClientName: 'Adrian Blum' },
    { id: 'act-5b', type: 'message_sent', description: 'Trainingsplan an Ramon Schweizer gesendet', timestamp: daysAgo(2), relatedClientName: 'Ramon Schweizer' },
    { id: 'act-5c', type: 'session_completed', description: 'Session mit Ramon Schweizer abgeschlossen', timestamp: daysAgo(3), relatedClientName: 'Ramon Schweizer' },
  ],
  c6: [],
  c7: [
    { id: 'act-7a', type: 'session_completed', description: 'Session mit Fabienne Gerber abgeschlossen', timestamp: hoursAgo(1), relatedClientName: 'Fabienne Gerber' },
    { id: 'act-7b', type: 'message_sent', description: 'Fortschrittsbericht an Raphael Ammann gesendet', timestamp: hoursAgo(2), relatedClientName: 'Raphael Ammann' },
    { id: 'act-7c', type: 'client_onboarded', description: 'Neue Kundin Chiara Volpe ongeboardet', timestamp: hoursAgo(4), relatedClientName: 'Chiara Volpe' },
    { id: 'act-7d', type: 'workout_created', description: 'Neues Workout "Recovery & Mobility Flow" erstellt', timestamp: hoursAgo(6) },
    { id: 'act-7e', type: 'session_completed', description: 'Session mit Marco Wyss abgeschlossen', timestamp: hoursAgo(8), relatedClientName: 'Marco Wyss' },
    { id: 'act-7f', type: 'feedback_received', description: 'Neue 5-Sterne Bewertung von Alina Fehr', timestamp: daysAgo(1), relatedClientName: 'Alina Fehr' },
    { id: 'act-7g', type: 'program_assigned', description: 'Programm "Comeback Program" an Sven Dietrich zugewiesen', timestamp: daysAgo(1), relatedClientName: 'Sven Dietrich' },
    { id: 'act-7h', type: 'message_sent', description: 'Ernährungstipps an Selina Roth gesendet', timestamp: daysAgo(1), relatedClientName: 'Selina Roth' },
    { id: 'act-7i', type: 'session_completed', description: 'Session mit Noemi Sutter abgeschlossen', timestamp: daysAgo(2), relatedClientName: 'Noemi Sutter' },
    { id: 'act-7j', type: 'feedback_received', description: 'Neue Bewertung von Lena Bosshard', timestamp: daysAgo(2), relatedClientName: 'Lena Bosshard' },
  ],
};
