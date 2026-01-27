# Prometheus Enterprise

Modern management software for fitness studios, physiotherapy practices, therapy centers, sports clubs and associations.

## Use Cases

- **Fitness Studios & Gyms** - Member management, class scheduling, performance tracking
- **Physiotherapy Practices** - Patient management, appointment scheduling, treatment tracking
- **Therapy & Rehabilitation Centers** - Session management, progress documentation
- **Sports Clubs & Associations** - Member administration, event planning, fee collection
- **Yoga & Pilates Studios** - Class management, instructor scheduling
- **Martial Arts Schools** - Belt progression tracking, tournament management
- **Dance Studios** - Course registration, recital planning

## Features

- **Dashboard** - Real-time overview of members, revenue and sessions
- **Member Management (CRM)** - Complete member profiles with activity status
- **Staff Management** - Staff profiles, specializations and performance tracking
- **Calendar** - Session planning and class overview
- **Financials** - Payment overview, MRR tracking, outstanding invoices
- **Analytics & Reports** - Utilization, retention, staff performance, export
- **Access Control** - Check-in via face recognition or Bluetooth
- **Stripe Integration** - Automated payment processing

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **Charts**: Recharts
- **Payments**: Stripe

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Create production build
npm run build
```

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

## Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Trial** | Free | 14 days free trial |
| **Basic** | $49/month | Up to 100 members, 3 staff |
| **Premium** | $89/month | Up to 500 members, 10 staff, Analytics |
| **VIP** | $149/month | Unlimited, Priority Support, Custom Branding |

## Project Structure

```
src/
├── components/     # UI Components
├── contexts/       # React Contexts (Auth)
├── lib/            # Utilities, Supabase Client
├── pages/          # Page Components
├── services/       # API Services
└── types/          # TypeScript Types
```

## License

Proprietary - Prometheus Enterprise
