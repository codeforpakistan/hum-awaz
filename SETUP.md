# Hum Awaaz - Setup Instructions

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Git

## Installation

1. Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd hum-awaaz
pnpm install
```

2. Copy the environment variables:

```bash
cp .env.example .env.local
```

## Supabase Setup

1. Go to [Supabase Dashboard](https://app.supabase.com) and create a new project

2. Once your project is created, go to Settings > API and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon/Public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Update your `.env.local` file with these values

4. Go to SQL Editor in Supabase dashboard and run the schema from `supabase/schema.sql`

5. Enable Email Authentication:
   - Go to Authentication > Providers
   - Enable Email provider
   - Configure email templates as needed

## Running the Application

```bash
pnpm run dev
```

Visit `http://localhost:3000` to see the application.

## Initial Data (Optional)

To add some sample data, run this SQL in Supabase SQL Editor:

```sql
-- Insert sample processes
INSERT INTO public.processes (title, title_ur, description, description_ur, status, category, start_date, end_date, organization)
VALUES 
  ('Education Reform Initiative', 'تعلیمی اصلاحات', 
   'Share your ideas on improving the education system in Pakistan', 
   'پاکستان میں تعلیمی نظام کو بہتر بنانے کے لیے اپنے خیالات شیئر کریں',
   'active', 'education', NOW(), NOW() + INTERVAL '30 days', 'Ministry of Education'),
  
  ('Healthcare Accessibility Program', 'صحت کی سہولیات', 
   'Discuss ways to make healthcare more accessible to all citizens', 
   'تمام شہریوں کے لیے صحت کی سہولیات کو بہتر بنانے پر تبادلہ خیال',
   'active', 'healthcare', NOW(), NOW() + INTERVAL '45 days', 'Ministry of Health'),
  
  ('Green Pakistan Initiative', 'سبز پاکستان', 
   'Environmental conservation and climate action proposals', 
   'ماحولیاتی تحفظ اور موسمیاتی اقدامات',
   'active', 'environment', NOW(), NOW() + INTERVAL '60 days', 'Climate Change Ministry');
```

## ✅ Fully Implemented Features

### **Authentication System**
- User registration with email verification
- Login/logout functionality  
- Protected routes and user sessions
- User profile management

### **Database Architecture**
- Complete PostgreSQL schema with RLS policies
- Users/Profiles with multilingual support
- Processes (Government Consultations)
- Proposals with voting and status tracking
- Discussion/Comment threads
- Participation tracking and analytics
- Notification system ready

### **Core Application**
- **Homepage** - Hero section, active processes, statistics
- **Processes** - Browse, filter by category, search functionality
- **Process Details** - Full process pages with proposals, voting, discussions
- **Dashboard** - User activity overview, participation statistics
- **Profile** - Complete user profile management
- **About** - Comprehensive platform information
- **Authentication** - Login/Register with form validation

### **Interactive Features**
- **Proposal Submission** - Users can submit proposals to processes
- **Voting System** - Support/Oppose/Neutral voting on proposals
- **Discussion Threads** - Comment on processes and proposals
- **Participation Tracking** - Automatic tracking of user engagement
- **Real-time Updates** - Dynamic vote counts and participation stats

### **Multilingual Support**
- Complete English/Urdu translations
- RTL text direction support for Urdu
- Language switcher component
- Persistent language preferences

### **User Experience**
- Responsive design for all screen sizes  
- Loading states and error handling
- Form validation and user feedback
- Accessibility features built-in
- Modern UI with shadcn/ui components

## System Status

🟢 **PRODUCTION READY** - All core features are fully implemented and tested.

## Project Structure

```
hum-awaaz/
├── app/                    # Next.js app directory
│   ├── dashboard/         # User dashboard
│   ├── processes/         # Consultations/processes
│   ├── login/            # Authentication pages
│   └── register/
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utilities and configs
│   ├── supabase.ts       # Supabase client & types
│   └── auth-context.tsx  # Auth provider
└── supabase/             # Database schema
    └── schema.sql        # Complete database setup
```

## Troubleshooting

1. **Authentication not working**: 
   - Check Supabase email settings
   - Verify environment variables

2. **Database errors**:
   - Ensure schema.sql ran successfully
   - Check RLS policies in Supabase

3. **Styling issues**:
   - Run `pnpm install` to ensure all dependencies are installed
   - Check Tailwind configuration

## Support

For issues or questions, please check the Supabase documentation or create an issue in the repository.