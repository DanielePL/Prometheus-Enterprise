// Static demo data for presentation mode
// All data is deterministic (no Math.random()) and cross-referenced

import type { AccessMethod, AccessStatus } from '@/types/database';
import type { CoachSummary, CoachClient, CoachWorkout, CoachProgram } from '@/types/coachIntegration';

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
];

export const DEMO_COACH_SUMMARIES: Record<string, CoachSummary> = {
  'coach-app-user-1': { userId: 'coach-app-user-1', email: 'marco.bianchi@prometheus-gym.ch', fullName: 'Marco Bianchi', totalClients: 18, totalWorkouts: 45, totalPrograms: 6, activeSessions: 12, lastActivity: daysAgo(0) },
  'coach-app-user-2': { userId: 'coach-app-user-2', email: 'sofia.meier@prometheus-gym.ch', fullName: 'Sofia Meier', totalClients: 24, totalWorkouts: 62, totalPrograms: 8, activeSessions: 18, lastActivity: daysAgo(0) },
  'coach-app-user-3': { userId: 'coach-app-user-3', email: 'elena.weber@prometheus-gym.ch', fullName: 'Elena Weber', totalClients: 22, totalWorkouts: 38, totalPrograms: 5, activeSessions: 10, lastActivity: daysAgo(1) },
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
