import { supabase } from '@/lib/supabase';
import type { MembershipType, ActivityStatus } from '@/types/database';

// Swiss names for realistic demo data
const firstNames = [
  'Luca', 'Noah', 'Matteo', 'Elias', 'Leon', 'David', 'Samuel', 'Nico', 'Ben', 'Jonas',
  'Mia', 'Emma', 'Sofia', 'Lena', 'Anna', 'Laura', 'Sara', 'Elena', 'Nina', 'Lisa',
  'Tim', 'Jan', 'Lukas', 'Felix', 'Marco', 'Rafael', 'Simon', 'Julian', 'Patrick', 'Adrian',
  'Julia', 'Lea', 'Chiara', 'Alina', 'Lara', 'Michelle', 'Jessica', 'Melanie', 'Sandra', 'Claudia'
];

const lastNames = [
  'Müller', 'Meier', 'Schmid', 'Keller', 'Weber', 'Huber', 'Schneider', 'Meyer', 'Steiner', 'Fischer',
  'Gerber', 'Brunner', 'Baumann', 'Frei', 'Zimmermann', 'Moser', 'Widmer', 'Wyss', 'Graf', 'Roth',
  'Bianchi', 'Rossi', 'Ferrari', 'Bernasconi', 'Bentivoglio', 'Colombo', 'Fontana', 'Lutz', 'Arnold', 'Fuchs'
];

const coachSpecializations = [
  'Strength Training', 'CrossFit', 'Yoga', 'HIIT', 'Personal Training',
  'Boxing', 'Pilates', 'Nutrition', 'Rehabilitation', 'Bodybuilding'
];

// Generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate random item from array
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate email from name
function generateEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'outlook.com', 'bluewin.ch', 'sunrise.ch', 'protonmail.com'];
  const cleanFirst = firstName.toLowerCase().replace(/[äöü]/g, (c) => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue' }[c] || c));
  const cleanLast = lastName.toLowerCase().replace(/[äöü]/g, (c) => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue' }[c] || c));
  return `${cleanFirst}.${cleanLast}@${randomItem(domains)}`;
}

// Generate Swiss phone number
function generatePhone(): string {
  const prefixes = ['076', '077', '078', '079'];
  const prefix = randomItem(prefixes);
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return `+41 ${prefix} ${number.toString().slice(0, 3)} ${number.toString().slice(3, 5)} ${number.toString().slice(5)}`;
}

export interface MockDataConfig {
  memberCount: number;
  coachCount: number;
  sessionsPerDay: number;
  daysOfHistory: number;
}

const defaultConfig: MockDataConfig = {
  memberCount: 127,
  coachCount: 6,
  sessionsPerDay: 8,
  daysOfHistory: 60,
};

export const mockDataService = {
  async seedDemoData(gymId: string, config: MockDataConfig = defaultConfig) {
    console.log('Starting demo data seeding...');

    // 1. Create coaches first
    const coaches = await this.createCoaches(gymId, config.coachCount);
    console.log(`Created ${coaches.length} coaches`);

    // 2. Create members
    const members = await this.createMembers(gymId, config.memberCount, coaches.map(c => c.id));
    console.log(`Created ${members.length} members`);

    // 3. Create visits history
    await this.createVisitHistory(gymId, members, config.daysOfHistory);
    console.log('Created visit history');

    // 4. Create sessions
    await this.createSessions(gymId, coaches, members, config.sessionsPerDay, config.daysOfHistory);
    console.log('Created sessions');

    // 5. Create payments
    await this.createPayments(gymId, members);
    console.log('Created payments');

    // 6. Create some "today" members with different subscriptions
    const todayMembers = await this.createTodayMembers(gymId, coaches.map(c => c.id));
    console.log(`Created ${todayMembers.length} members added today`);

    return { coaches, members: [...members, ...todayMembers] };
  },

  async createCoaches(gymId: string, count: number) {
    const coaches = [];
    const usedNames = new Set<string>();

    for (let i = 0; i < count; i++) {
      let firstName, lastName, fullName;
      do {
        firstName = randomItem(firstNames);
        lastName = randomItem(lastNames);
        fullName = `${firstName} ${lastName}`;
      } while (usedNames.has(fullName));
      usedNames.add(fullName);

      coaches.push({
        gym_id: gymId,
        name: fullName,
        email: generateEmail(firstName, lastName),
        phone: generatePhone(),
        specialization: randomItem(coachSpecializations),
        is_active: Math.random() > 0.1,
        client_count: Math.floor(Math.random() * 25) + 5,
        hourly_rate: [80, 100, 120, 150][Math.floor(Math.random() * 4)],
        bio: `Certified ${randomItem(coachSpecializations)} instructor with ${Math.floor(Math.random() * 10) + 2} years of experience.`,
      });
    }

    const { data, error } = await supabase.from('coaches').insert(coaches).select();
    if (error) throw error;
    return data;
  },

  async createMembers(gymId: string, count: number, coachIds: string[]) {
    const members = [];
    const usedEmails = new Set<string>();
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    const membershipDistribution: MembershipType[] = [
      ...Array(15).fill('trial'),
      ...Array(45).fill('basic'),
      ...Array(30).fill('premium'),
      ...Array(10).fill('vip'),
    ];

    const statusDistribution: ActivityStatus[] = [
      ...Array(60).fill('active'),
      ...Array(25).fill('moderate'),
      ...Array(15).fill('inactive'),
    ];

    for (let i = 0; i < count; i++) {
      let firstName, lastName, email;
      do {
        firstName = randomItem(firstNames);
        lastName = randomItem(lastNames);
        email = generateEmail(firstName, lastName);
      } while (usedEmails.has(email));
      usedEmails.add(email);

      const membership = randomItem(membershipDistribution);
      const status = randomItem(statusDistribution);
      const joinDate = randomDate(sixMonthsAgo, now);

      // Calculate last visit based on activity status
      let lastVisit: Date | null = null;
      if (status === 'active') {
        lastVisit = randomDate(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), now);
      } else if (status === 'moderate') {
        lastVisit = randomDate(new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000));
      } else {
        lastVisit = randomDate(new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000));
      }

      const monthlyFees: Record<MembershipType, number> = {
        trial: 0,
        basic: 49,
        premium: 89,
        vip: 149,
      };

      members.push({
        gym_id: gymId,
        name: `${firstName} ${lastName}`,
        email,
        phone: generatePhone(),
        membership_type: membership,
        monthly_fee: monthlyFees[membership],
        activity_status: status,
        coach_id: Math.random() > 0.4 ? randomItem(coachIds) : null,
        total_visits: Math.floor(Math.random() * 80) + (status === 'active' ? 20 : status === 'moderate' ? 5 : 0),
        last_visit: lastVisit?.toISOString(),
        join_date: joinDate.toISOString(),
        notes: Math.random() > 0.7 ? randomItem([
          'Prefers morning sessions',
          'Working on weight loss goals',
          'Training for marathon',
          'Post-injury rehabilitation',
          'Interested in group classes',
        ]) : null,
      });
    }

    const { data, error } = await supabase.from('members').insert(members).select();
    if (error) throw error;
    return data;
  },

  async createTodayMembers(gymId: string, coachIds: string[]) {
    const todayMembers = [
      { firstName: 'Marco', lastName: 'Bianchi', membership: 'vip' as MembershipType, fee: 149 },
      { firstName: 'Sofia', lastName: 'Meier', membership: 'premium' as MembershipType, fee: 89 },
      { firstName: 'Luca', lastName: 'Schneider', membership: 'basic' as MembershipType, fee: 49 },
      { firstName: 'Elena', lastName: 'Weber', membership: 'premium' as MembershipType, fee: 89 },
      { firstName: 'Noah', lastName: 'Keller', membership: 'trial' as MembershipType, fee: 0 },
      { firstName: 'Anna', lastName: 'Fischer', membership: 'basic' as MembershipType, fee: 49 },
    ];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const members = todayMembers.map((m, index) => {
      const joinTime = new Date(todayStart.getTime() + (9 + index * 1.5) * 60 * 60 * 1000);
      return {
        gym_id: gymId,
        name: `${m.firstName} ${m.lastName}`,
        email: generateEmail(m.firstName, m.lastName),
        phone: generatePhone(),
        membership_type: m.membership,
        monthly_fee: m.fee,
        activity_status: 'active' as ActivityStatus,
        coach_id: Math.random() > 0.5 ? randomItem(coachIds) : null,
        total_visits: 0,
        last_visit: null,
        join_date: joinTime.toISOString(),
        created_at: joinTime.toISOString(),
      };
    });

    const { data, error } = await supabase.from('members').insert(members).select();
    if (error) throw error;
    return data;
  },

  async createVisitHistory(gymId: string, members: { id: string; activity_status: string }[], daysOfHistory: number) {
    const visits = [];
    const now = new Date();

    for (const member of members) {
      // More visits for active members
      const visitFrequency = member.activity_status === 'active' ? 4 : member.activity_status === 'moderate' ? 1.5 : 0.3;
      const numVisits = Math.floor(daysOfHistory * visitFrequency / 7);

      for (let i = 0; i < numVisits; i++) {
        const visitDate = randomDate(new Date(now.getTime() - daysOfHistory * 24 * 60 * 60 * 1000), now);
        const checkInHour = 6 + Math.floor(Math.random() * 16); // 6 AM to 10 PM
        visitDate.setHours(checkInHour, Math.floor(Math.random() * 60), 0, 0);

        const checkOutDate = new Date(visitDate.getTime() + (45 + Math.floor(Math.random() * 75)) * 60 * 1000);

        visits.push({
          member_id: member.id,
          gym_id: gymId,
          check_in: visitDate.toISOString(),
          check_out: checkOutDate.toISOString(),
          check_in_method: randomItem(['manual', 'bluetooth', 'face_recognition'] as const),
        });
      }
    }

    // Batch insert visits (Supabase has limits)
    const batchSize = 500;
    for (let i = 0; i < visits.length; i += batchSize) {
      const batch = visits.slice(i, i + batchSize);
      const { error } = await supabase.from('member_visits').insert(batch);
      if (error) console.error('Visit insert error:', error);
    }
  },

  async createSessions(
    gymId: string,
    coaches: { id: string; name: string; specialization: string }[],
    members: { id: string }[],
    sessionsPerDay: number,
    daysOfHistory: number
  ) {
    const sessions = [];
    const sessionTypes = ['Personal Training', 'Group Class', 'CrossFit', 'Yoga', 'HIIT', 'Boxing', 'Pilates'];
    const now = new Date();

    for (let day = -daysOfHistory; day <= 7; day++) {
      const date = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);

      for (let s = 0; s < sessionsPerDay; s++) {
        const coach = randomItem(coaches);
        const startHour = 7 + Math.floor(s * 1.5);
        const startTime = new Date(date);
        startTime.setHours(startHour, 0, 0, 0);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

        const isPast = startTime < now;

        sessions.push({
          gym_id: gymId,
          coach_id: coach.id,
          title: randomItem(sessionTypes),
          session_type: randomItem(['personal', 'group', 'class'] as const),
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          max_participants: randomItem([1, 8, 12, 15, 20]),
          status: isPast ? (Math.random() > 0.1 ? 'completed' : 'cancelled') : 'scheduled',
          notes: Math.random() > 0.8 ? 'Bring your own mat' : null,
        });
      }
    }

    const batchSize = 200;
    for (let i = 0; i < sessions.length; i += batchSize) {
      const batch = sessions.slice(i, i + batchSize);
      const { error } = await supabase.from('sessions').insert(batch);
      if (error) console.error('Session insert error:', error);
    }
  },

  async createPayments(gymId: string, members: { id: string; monthly_fee: number; membership_type: string }[]) {
    const payments = [];
    const now = new Date();

    for (const member of members) {
      if (member.membership_type === 'trial') continue;

      // Create 3 months of payment history
      for (let month = 0; month < 3; month++) {
        const dueDate = new Date(now.getFullYear(), now.getMonth() - month, 1);
        const isPaid = month > 0 || Math.random() > 0.15;
        const isOverdue = !isPaid && month === 0 && Math.random() > 0.5;

        payments.push({
          gym_id: gymId,
          member_id: member.id,
          amount: member.monthly_fee,
          status: isPaid ? 'paid' : isOverdue ? 'overdue' : 'pending',
          due_date: dueDate.toISOString(),
          paid_date: isPaid ? new Date(dueDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : null,
          payment_method: isPaid ? randomItem(['card', 'bank_transfer', 'cash'] as const) : null,
          description: `Monthly membership - ${dueDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        });
      }
    }

    const batchSize = 500;
    for (let i = 0; i < payments.length; i += batchSize) {
      const batch = payments.slice(i, i + batchSize);
      const { error } = await supabase.from('payments').insert(batch);
      if (error) console.error('Payment insert error:', error);
    }
  },

  async clearAllData(gymId: string) {
    console.log('Clearing all demo data...');

    // Delete in correct order due to foreign keys
    await supabase.from('session_participants').delete().eq('session_id', gymId);
    await supabase.from('member_visits').delete().eq('gym_id', gymId);
    await supabase.from('payments').delete().eq('gym_id', gymId);
    await supabase.from('sessions').delete().eq('gym_id', gymId);
    await supabase.from('alerts').delete().eq('gym_id', gymId);
    await supabase.from('members').delete().eq('gym_id', gymId);
    await supabase.from('coaches').delete().eq('gym_id', gymId);

    console.log('All data cleared');
  },

  async getMembersAddedToday(gymId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('gym_id', gymId)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
