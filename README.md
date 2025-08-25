# 🗳️ hum awaz - Voice of the People

**Pakistan's Premier Participatory Democracy Platform**

hum awaz (حم آواز) empowers Pakistani citizens to actively participate in democratic processes through digital consultations, proposal submissions, and collaborative decision-making. Built for transparency, accessibility, and meaningful civic engagement.

---

## 🚀 Features

### 🏛️ **Democratic Processes**
- **Public Consultations**: Government-initiated processes on policy matters
- **Multi-Language Support**: Full English/Urdu bilingual interface with RTL support
- **Time-Based Progress**: Real-time progress tracking for active consultations
- **Category Organization**: Education, Healthcare, Infrastructure, Economy, Environment, Governance

### 📝 **Citizen Proposals**
- **Proposal Submission**: Citizens can submit detailed policy proposals
- **Collaborative Editing**: Multi-language proposal creation
- **Status Tracking**: Pending → Approved → Under Review → Implemented
- **Process Integration**: Proposals linked to relevant consultation processes

### 🗳️ **Interactive Voting System**
- **Three-Option Voting**: Support, Oppose, Neutral positions
- **Vote Changes Allowed**: Users can update votes until deadline
- **Real-Time Updates**: Instant vote count refresh
- **Visual Feedback**: Clear indication of user's current vote

### 💬 **Discussion Platform**
- **Process Discussions**: General conversation on consultation topics
- **Proposal Comments**: Threaded discussions on specific proposals
- **Multi-Language Content**: Comments in English and Urdu
- **Community Engagement**: Foster dialogue between citizens

### 📊 **Advanced Filtering & Search**
- **Smart Search**: Find processes/proposals by keywords
- **Category Filters**: Browse by policy area
- **Status Filtering**: Active, closed, pending processes
- **Sorting Options**: Recent, popular, most supported

### 🔐 **Security & Authentication**
- **Supabase Auth**: Secure user registration and login
- **Row Level Security**: Database-level access control
- **Profile Management**: User profiles with preferences
- **Participation Tracking**: Engagement analytics

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern utility-first styling
- **Shadcn/ui**: High-quality UI components
- **Lucide Icons**: Consistent iconography

### **Backend**
- **Supabase**: Backend-as-a-Service platform
- **PostgreSQL**: Robust relational database
- **Row Level Security**: Fine-grained access control
- **Real-time Subscriptions**: Live data updates

### **Infrastructure**
- **Vercel**: Deployment and hosting
- **Edge Functions**: Global performance optimization
- **CDN**: Fast content delivery worldwide

---

## 🏗️ Architecture

### **Database Schema**
```
profiles         → User profiles and preferences
processes        → Democratic consultation processes  
proposals        → Citizen-submitted proposals
discussions      → Comments and conversations
votes           → User votes on proposals
participations  → Engagement tracking
notifications   → User alerts and updates
```

### **Key Relationships**
- Processes have many Proposals
- Proposals have many Votes and Discussions
- Users can participate in multiple Processes
- Real-time vote counting with database triggers

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and pnpm
- Supabase account and project
- Git for version control

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/codeforpakistan/hum-awaaz.git
   cd hum-awaaz
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   ```bash
   # Run database migrations in order:
   # 1. Drop existing tables (if any)
   psql -h your-db-host -d your-db -f supabase/step1-drop-tables.sql
   
   # 2. Create schema and tables
   psql -h your-db-host -d your-db -f supabase/step2-create-schema.sql
   
   # 3. Insert sample data
   psql -h your-db-host -d your-db -f supabase/step3-sample-data.sql
   ```

5. **Run Development Server**
   ```bash
   pnpm run dev
   ```

6. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
hum-awaaz/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── processes/         # Democratic processes
│   │   ├── [id]/         # Individual process pages
│   │   └── new/          # Create new process
│   ├── proposals/         # Citizen proposals
│   └── layout.tsx        # Global layout
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn/ui components
│   ├── main-nav.tsx      # Navigation component
│   ├── language-provider.tsx # i18n context
│   └── footer.tsx        # Footer component
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Database client
│   ├── auth-context.tsx  # Authentication context
│   └── utils.ts          # Helper functions
├── supabase/             # Database scripts
│   ├── step1-drop-tables.sql
│   ├── step2-create-schema.sql
│   └── step3-sample-data.sql
└── public/               # Static assets
```

---

## 🌟 Key Features Deep Dive

### **Participatory Democracy**
hum awaz implements modern participatory democracy principles:
- **Deliberative Process**: Structured discussions before voting
- **Inclusive Participation**: Multi-language accessibility
- **Transparent Governance**: Open process and result tracking
- **Iterative Engagement**: Vote changes allowed during consultation period

### **Bilingual Excellence**
True Pakistani experience with:
- **Native Urdu Support**: RTL text rendering and Urdu typography
- **Cultural Context**: Pakistani government structure integration
- **Flexible Language Switching**: User preference persistence
- **Content Localization**: All interface elements translated

### **Real-Time Democracy**
Modern digital engagement through:
- **Live Vote Counts**: Instant result updates
- **Dynamic Progress Tracking**: Time-based consultation progress
- **Immediate Feedback**: Instant vote confirmation
- **Notification System**: Real-time updates on process changes

---

## 📊 Usage Analytics

Track democratic engagement through:
- **Participation Rates**: Users actively engaging in processes
- **Geographic Distribution**: Participation across Pakistan
- **Category Popularity**: Most discussed policy areas
- **Proposal Success**: Conversion from submission to implementation

---

## 🗺️ Roadmap

### **Phase 1: Foundation** ✅
- [x] Core democratic processes
- [x] Proposal submission system
- [x] Interactive voting
- [x] Discussion platform
- [x] Bilingual interface

### **Phase 2: Enhancement** (Next 3 months)
- [ ] Participatory budgeting module
- [ ] Advanced voting systems (ranked choice, quadratic)
- [ ] Geographic mapping integration
- [ ] Survey and questionnaire engine
- [ ] Mobile app development

### **Phase 3: Scale** (6-12 months)
- [ ] Multi-tenant government support
- [ ] API for third-party integrations
- [ ] Advanced analytics dashboard
- [ ] AI-powered proposal analysis
- [ ] Blockchain vote verification

### **Phase 4: Innovation** (12+ months)
- [ ] Citizen initiative system
- [ ] Assembly management tools
- [ ] Cross-border consultation capabilities
- [ ] Academic research integration

*See [ROADMAP.md](./ROADMAP.md) for detailed development plans*

---

## 🤝 Contributing

We welcome contributions from developers, designers, policy experts, and civic engagement specialists!

### **Development Workflow**
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### **Contribution Areas**
- **Frontend Development**: React/Next.js components
- **Backend Development**: Supabase functions and triggers
- **UI/UX Design**: User experience improvements
- **Translation**: Urdu and regional language support
- **Documentation**: API docs and user guides
- **Testing**: Automated testing and QA

### **Code Standards**
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Conventional commits for clear history
- Component-based architecture
- Responsive design principles

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🏛️ Government Partnerships

hum awaz is designed for collaboration with:
- **Federal Government**: National policy consultations
- **Provincial Governments**: Regional governance initiatives  
- **Local Governments**: Community-level decision making
- **Civil Society**: NGO and advocacy group engagement
- **Academic Institutions**: Research and analysis partnerships

---

## 📞 Support

### **Community Support**
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Community Q&A and ideas
- **Live Platform**: [humawaz.codeforpakistan.org](https://humawaz.codeforpakistan.org)
- **Documentation**: Comprehensive guides and tutorials

### **Professional Support**
For government organizations and large-scale deployments:
- **Implementation Consulting**: Custom deployment assistance
- **Training Programs**: User and administrator training
- **Technical Integration**: API and system integration support
- **Ongoing Maintenance**: Long-term support contracts

---

## 🌍 Vision

**Democratizing Democracy in Pakistan**

hum awaz envisions a Pakistan where every citizen has a meaningful voice in governance. Through accessible technology, transparent processes, and inclusive participation, we're building the digital infrastructure for 21st-century democracy.

Our platform bridges the gap between citizens and government, fostering:
- **Active Civic Engagement**: Beyond voting to continuous participation
- **Transparent Governance**: Open processes and accountable outcomes  
- **Inclusive Decision-Making**: Voices from all communities and backgrounds
- **Evidence-Based Policy**: Data-driven insights for better governance

---

## 🎯 Impact Goals

### **Participation Targets**
- **100K+ Registered Users** in first year
- **500+ Democratic Processes** hosted annually
- **10K+ Proposals** submitted by citizens
- **80%+ User Satisfaction** with platform experience

### **Governance Outcomes**
- **Increased Transparency**: Open government data and processes
- **Better Policy Decisions**: Evidence-based, citizen-informed policies
- **Stronger Democracy**: Higher civic engagement and trust
- **Digital Inclusion**: Bridging urban-rural participation gaps

---

## 🙏 Acknowledgments

Special thanks to:
- **Open Source Community**: Building on incredible open-source tools
- **Decidim Project**: Inspiration from leading participatory democracy platform
- **Pakistani Civil Society**: Advocacy for transparent governance
- **Beta Users**: Early feedback and platform testing
- **Contributors**: Developers, designers, and democracy advocates

---

*Built with ❤️ for the people of Pakistan*

**hum awaz - حم آواز - Voice of the People**

---

### 🔗 Quick Links

| Resource | Link |
|----------|------|
| 🌐 **Live Platform** | [https://humawaz.codeforpakistan.org](https://humawaz.codeforpakistan.org) |
| 📚 **Documentation** | [/docs](./docs) |
| 🗺️ **Roadmap** | [ROADMAP.md](./ROADMAP.md) |
| 🐛 **Issues** | [GitHub Issues](https://github.com/codeforpakistan/hum-awaaz/issues) |
| 💬 **Discussions** | [GitHub Discussions](https://github.com/codeforpakistan/hum-awaaz/discussions) |
| 📧 **Contact** | support@humawaaz.pk |