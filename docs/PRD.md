# UDDAYA - Product Requirements Document
## AI-Powered Job Matching Platform

**Version:** 1.0  
**Last Updated:** Sept 29, 2026  
**Status:** Ready for Engineering  
**Project Lead:** Sairam Kumar  
**Organization:** Uddaya Job Platform  

---

## 📑 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [Goals & Success Metrics](#goals--success-metrics)
4. [User Personas](#user-personas)
5. [Detailed Feature Requirements](#detailed-feature-requirements)
6. [Technical Requirements](#technical-requirements)
7. [Database Schema](#database-schema)
8. [API Specification](#api-specification)
9. [Integration Specifications](#integration-specifications)
10. [12-Week Development Timeline](#12-week-development-timeline)
11. [Launch Strategy](#launch-strategy)
12. [Success Metrics & KPIs](#success-metrics--kpis)
13. [Dependencies & Risks](#dependencies--risks)
14. [Deliverables Checklist](#deliverables-checklist)
15. [Budget Estimate](#budget-estimate)
16. [Success Criteria by Phase](#success-criteria-by-phase)

---

## 1. Executive Summary

### Product Vision
**Uddaya** ("Rise, Ascent, Progress" in Sanskrit) is an AI-powered job matching platform that revolutionizes how candidates find opportunities and recruiters discover talent in India. By combining semantic job matching, intelligent candidate screening, and AI-driven interview preparation, Uddaya delivers a superior alternative to traditional job portals like Naukri and Hirist.

### Problem Statement
- **Job Seekers:** Receive 50+ irrelevant job recommendations daily; spend hours sifting through mismatched roles
- **Recruiters:** Spend 5+ hours/week manually screening resumes; 70% of applications are irrelevant; time-to-hire averages 45+ days
- **Market Gap:** Existing platforms use keyword matching only; no AI-powered semantic understanding of skills and requirements

### Solution
Uddaya introduces:
- **Smart Semantic Matching:** Claude API powers 87%+ accuracy in job-candidate alignment
- **Real-Time Alerts:** Instant notifications when jobs match candidate profiles
- **Interview Automation:** AI mock interviews with real-time feedback
- **Recruiter Agents:** Automated candidate outreach, scheduling, and offer generation

### Market Opportunity
- **TAM:** India's job market: 50M+ job seekers, 500K+ recruiters
- **Initial Target:** Tech & startup hiring (higher conversion, higher LTV)
- **Revenue Model:** Freemium for candidates; subscription for recruiters (₹5,000-50,000/month)

### Key Differentiators
| Feature | Naukri | Hirist | Uddaya |
|---------|--------|--------|--------|
| AI Matching | Keyword-based | Template matching | **Semantic AI** |
| Interview Prep | External links | Basic tests | **Claude-powered mock interviews** |
| Recruiter Automation | Manual | Limited | **Full agentic workflows** |
| Resume Analysis | None | None | **AI optimization suggestions** |
| Match Explanations | None | None | **Detailed "why you match" reports** |

### Financial Projections (Year 1)
- **Month 3:** 500 recruiter customers, ₹15L MRR
- **Month 6:** 2,000 recruiter customers, ₹60L MRR
- **Month 12:** 5,000 recruiter customers, ₹200L+ MRR

---

## 2. Product Overview

### Platform Architecture

```
┌─────────────────────────────────────────────────┐
│           UDDAYA PLATFORM ARCHITECTURE          │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐         ┌──────────────┐     │
│  │  Candidate   │         │  Recruiter   │     │
│  │  Web & Mobile│         │  Web & Mobile│     │
│  └──────────────┘         └──────────────┘     │
│         │                        │              │
│         └────────────┬───────────┘              │
│                      │                          │
│            ┌─────────▼─────────┐               │
│            │   API Gateway     │               │
│            │  (Authentication) │               │
│            └─────────┬─────────┘               │
│                      │                          │
│    ┌─────────────────┼─────────────────┐       │
│    │                 │                 │       │
│  ┌─▼──┐  ┌─────────▼────────┐  ┌──────▼──┐   │
│  │REST│  │  Core Services   │  │ WebSocket│  │
│  │API │  │ (Jobs, Profiles, │  │   Server │  │
│  └────┘  │  Applications)   │  └──────────┘   │
│          └──────────┬───────┘                 │
│                      │                          │
│    ┌─────────────────┼─────────────────┐       │
│    │                 │                 │       │
│  ┌─▼──────┐  ┌──────▼──────┐  ┌──────▼────┐  │
│  │PostgreSQL│  │   Redis    │  │Elasticsearch│ │
│  │ (Main DB)│  │  (Cache)   │  │  (Search)  │  │
│  └─────────┘  └────────────┘  └────────────┘  │
│                                                 │
│    ┌──────────────┐      ┌──────────────┐     │
│    │  Bull Queue  │      │  Pinecone    │     │
│    │ (Background) │      │ (Embeddings) │     │
│    └──────────────┘      └──────────────┘     │
│                                                 │
│    ┌──────────────────────────────────────┐   │
│    │    External Integrations             │   │
│    │ - Claude API (AI matching)           │   │
│    │ - LinkedIn OAuth (Auth)              │   │
│    │ - SendGrid (Email)                   │   │
│    │ - Razorpay (Payments)                │   │
│    │ - AWS S3 (Resume storage)            │   │
│    └──────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Core Components

**Frontend:**
- Next.js 14 (React, TypeScript)
- Responsive UI (Mobile, Tablet, Desktop)
- Real-time notifications (WebSocket)
- Dark mode support

**Backend:**
- Node.js 18+ with Fastify
- RESTful API + WebSocket
- Authentication (JWT + OAuth)
- Rate limiting & security

**Database:**
- PostgreSQL (relational data)
- Redis (sessions, caching, counters)
- Elasticsearch (full-text search)
- Pinecone (vector embeddings for semantic search)

**AI/ML:**
- Claude API (job matching, resume parsing, interviews)
- OpenAI Embeddings (skill/job vectors)
- Custom ML models (optional, for future)

**Background Jobs:**
- Bull Queue (resume parsing, email sending, alerts)
- Scheduled tasks (daily alerts, digest emails)

### User Types

1. **Job Seekers (Candidates):** Free platform users seeking opportunities
2. **Recruiters:** Paid subscribers posting jobs and managing applications
3. **Admin:** Platform moderators and analytics

---

## 3. Goals & Success Metrics

### Primary Goals (MVP, 3 months)

| Goal | Target | Metric |
|------|--------|--------|
| User Acquisition | 10,000 candidates | Active signups |
| Recruiter Adoption | 100 companies | Paid subscriptions |
| Job Matching Accuracy | 87%+ | Match score validation |
| Time-to-Hire Reduction | 30% | vs. traditional job portal |
| Interview Completion Rate | 60%+ | Mock interviews started → completed |
| Revenue Ready | ₹5L+ MRR | Recurring from subscriptions |

### Success KPIs (Ongoing)

**Candidate Metrics:**
- Daily Active Users (DAU): Target 2,000+ (Month 3)
- Application Rate: 3+ applications/candidate/week
- Profile Completion: 80%+
- Interview Prep Completion: 40% of candidates
- Job application → offer: 15%+ conversion

**Recruiter Metrics:**
- Time-to-Hire: 21 days average
- Cost-per-Hire: ₹2,000-5,000
- Offer Acceptance Rate: 70%+
- Recruiter Retention: 80%+ (MoM)
- Job Fill Rate: 60%+ within 30 days

**Platform Metrics:**
- Uptime: 99.5%+
- API Response Time: <200ms (p95)
- Page Load: <2 seconds
- Match Accuracy: 85%+ (validated)

---

## 4. User Personas

### Persona 1: Aarav (Job Seeker)

**Demographics:**
- Age: 28 years old
- Location: Bangalore, India
- Experience: 5 years as Senior Software Engineer
- Salary Expectations: ₹20-30 LPA

**Pain Points:**
- Receives 50+ irrelevant job recommendations daily from Naukri
- Spends 2+ hours/day filtering jobs manually
- Gets interviews for roles requiring skills he doesn't have
- Struggles with last-minute interview preparation
- No clear career progression visibility

**Goals:**
- Find 2-3 perfectly matched jobs/week
- Complete interviews within 2 weeks of application
- Prepare efficiently for tech interviews
- Track all applications in one dashboard
- Get salary insights for his role

**Platform Usage:**
- 30 minutes/day on job search
- 2-3 applications/week
- Attends 1-2 interviews/week
- Uses mock interview feature 1-2x/week

---

### Persona 2: Priya (Recruiter)

**Demographics:**
- Age: 35 years old
- Role: Senior Recruiter at Tech Startup
- Team Size: Recruiting for 5 open roles (Python, React, DevOps)
- Company Size: 50-100 people

**Pain Points:**
- Spends 5+ hours/week screening irrelevant CVs
- 70% of applications don't match required skills
- Manual scheduling of interviews is time-consuming
- Loses top candidates due to slow hiring process
- No visibility into time-to-hire or hiring metrics

**Goals:**
- Reduce time-to-hire from 45 to 25 days
- Auto-screen candidates using AI
- Get 50+ quality applications for each role
- Schedule interviews with 1-click
- Generate offer letters automatically

**Platform Usage:**
- 1-2 hours/day on platform
- Post 1-2 jobs/week
- Review applications daily
- Schedule 3-4 interviews/week
- Use analytics to track hiring metrics

---

## 5. Detailed Feature Requirements

### 5.1 Job Seeker Features

#### 5.1.1 Authentication & Onboarding

**Email Signup Flow:**
1. Signup page: Email, password, name
2. Email verification: Confirm email link
3. Profile setup: Location, headline, skills (multi-step form)
4. Resume upload: PDF, DOC, DOCX formats
5. Welcome tour: Feature discovery (optional skip)

**LinkedIn OAuth Integration:**
1. "Sign up with LinkedIn" button
2. Fetch profile data: Name, email, headline, experience, skills, profile photo
3. Auto-populate: All fetched data in profile
4. Confirmation page: Show fetched data, allow edits
5. Resume auto-parse: If LinkedIn profile data available

**Specs:**
- OAuth Flow: LinkedIn OAuth 2.0
- Data Sync: One-way (LinkedIn → Uddaya)
- Profile Auto-Completion: 75%+ from LinkedIn
- Stored Data: All editable by user

---

#### 5.1.2 Profile Management

**Profile Page:**
- Edit profile picture (upload, crop, delete)
- Name, email, phone (editable)
- Headline: Professional summary (e.g., "Senior Python Engineer | AWS | Leadership")
- Location: City + Remote option toggle
- Professional summary: 2-3 paragraph bio
- Experience: Timeline of jobs (company, title, duration, description)
- Education: School, degree, field, year
- Skills: Searchable, tag-based with endorsements
- Certifications: Certificate name, issuer, date, credential link
- Resume: Upload, delete, set as primary (multiple resumes supported)
- Profile completeness: Visual progress meter (target 80%+)

**Specs:**
- Profile completion scoring: Based on filled fields
- Skill endorsements: By other users (future feature)
- Resume parsing: Claude API extracts skills, experience, education
- Profile visibility: Public by default, can be private

---

#### 5.1.3 Job Search & Discovery

**Job Search Page:**
- Search bar: Job title, company, skills (full-text + semantic search)
- Filters (sidebar):
  * Location: Multi-select cities or Remote toggle
  * Experience level: Junior, Mid, Senior, Lead
  * Salary range: Slider (₹5L - ₹100L+)
  * Job type: Full-time, Part-time, Contract, Internship
  * Company size: Startup, Scale-up, Enterprise
  * Industry: Tech, Finance, Healthcare, etc.
  * Date posted: Last 7 days, 30 days, any
  * Salary transparency: Only jobs with salary revealed
- Results view: Grid or List toggle
- Sort options: Relevance, Most Recent, Salary, Match Score
- Save job: Heart icon, add to favorites
- Share job: Copy link, email, WhatsApp (future)

**Job Cards (Grid View):**
- Company logo (small)
- Job title (16px, bold)
- Company name
- Location + salary range (if disclosed)
- Match % badge (saffron): Shows match score (e.g., "87% Match")
- Tags: Skills required, job type
- Quick apply button
- Save/share icons

**Specs:**
- Search powered by: Elasticsearch (full-text) + Pinecone (semantic)
- Match score: Claude API scoring (0-100)
- Results pagination: 20 jobs per page
- Search latency: <200ms
- Filters: Remember user's last filters (local storage)

---

#### 5.1.4 Job Detail Page

**Display:**
- Company header: Logo, name, industry, company size, website
- Job title (36px, bold, saffron)
- Quick stats: Experience level, job type, salary, posted date
- Full job description: HTML formatted, rich text
- Key responsibilities: Bullet list
- Required skills: Tag list (navy background)
- Nice-to-have skills: Tag list (gray background)
- About the company: Description, culture, perks
- Company other jobs: Carousel of other open roles

**AI Match Explanation Section:**
- Match score (large, 36px, saffron): "87% Match"
- AI sparkle icon (decorative)
- Why you match section:
  * ✅ Python (Advanced) - You have, they need
  * ✅ AWS (3 years) - You have, they need
  * ⚠️ Kubernetes - Nice to have, you don't have
- Detailed explanation: "You're an excellent fit because..."
- Generated by Claude API

**CTA Buttons:**
- "Apply Now" (green, prominent, 48px)
- "Save Job" (outline, heart icon)
- "Share" (outline, share icon)

**Interview Prep Card:**
- "Prepare for this role" CTA
- "Start Mock Interview" (purple/saffron accent)
- "Get AI feedback on your answers"

**Specs:**
- Match score: Calculated by Claude API (semantic similarity)
- Score recalculated: When candidate profile updates
- Explanation: Generated from skill analysis
- Caching: Cache match scores for 24 hours

---

#### 5.1.5 Application Management

**Applications Dashboard:**
- View: Kanban board or table
- Columns:
  * Applied: Jobs recently applied to
  * Interview Scheduled: Upcoming interviews
  * Offer Received: Offers to review
  * Rejected: Rejected applications
- Drag-drop: Move applications between columns (visual only, no state change)

**Application Card:**
- Company name
- Job title
- Status indicator: Applied, Interview scheduled, Offer, Rejected
- Applied date: "Applied 2 days ago"
- Last update: Date of last status change
- Quick actions: Message recruiter, view job, withdraw application
- Interview date (if scheduled): Date + time + join link

**Application Status Tracking:**
- Timeline view: Show all status updates
- Last contact: When recruiter last messaged
- Next steps: AI suggestion based on application age
  * "No response in 3 days? Message the recruiter"
  * "Interview in 2 days, use interview prep tool"

**Specs:**
- Kanban drag-drop: Visual, non-functional (for design)
- Status updates: Real-time via WebSocket
- Notifications: Push + email for status changes
- Export: Download applications as CSV

---

#### 5.1.6 Saved Jobs

**Saved Jobs Page:**
- List of all saved jobs (heart icon marked)
- Sort by: Most recent, salary high-to-low, match score
- Filter by: Industry, company, salary range
- Bulk actions: Apply to all, add to list
- Create lists: Save jobs to custom lists (e.g., "Dream Jobs", "Backup Options")

**Specs:**
- Stored in database (users table + saved_jobs junction table)
- Sync across devices: Cloud-synced saved jobs
- Export: Download saved jobs list as PDF

---

#### 5.1.7 Messaging

**Recruiter Messages:**
- Message inbox: Conversations with recruiters
- Each message shows:
  * Recruiter name
  * Company
  * Message content
  * Timestamp
  * Read/unread status
- Conversation view: Thread of messages (chronological)
- Reply button: Send reply to recruiter
- Archive: Archive old conversations

**Features:**
- Real-time messaging: WebSocket-powered
- Notifications: Push + email for new messages
- Rich text: Support emoji, links, formatting

**Specs:**
- Message storage: PostgreSQL (messages table)
- Real-time sync: WebSocket server
- Archiving: Soft delete (messages remain in DB)

---

#### 5.1.8 AI Interview Prep

**Mock Interview Flow:**

1. **Setup Page:**
   - Select job to prepare for (dropdown)
   - Choose role type: Technical, HR, Behavioral
   - Difficulty level: Easy, Medium, Hard (affects question complexity)
   - Duration: 15 mins, 30 mins, 60 mins
   - Start interview button

2. **Interview Interface:**
   - Question displayed (20px, bold)
   - Timer: Countdown (e.g., 2:00 remaining)
   - Response input: Text area or voice input (optional, future)
   - Audio feedback option (optional)
   - Recording indicator: "Recording..." (if enabled)

3. **Answer Submission:**
   - Skip button: Skip question
   - Next button: Submit answer and move to next

4. **AI Feedback:**
   - Clarity score: 8/10 (progress bar)
   - Technical depth: 7/10
   - Communication: 8/10
   - Overall: 7.7/10 (large, bold)
   - Detailed feedback: "Great answer! You explained the problem well. Consider adding more about..."
   - Actionable suggestions: 3-5 bullets

5. **Completion Summary:**
   - All questions answered: 5/5 ✓
   - Average score: 7.8/10
   - Time spent: 14 minutes
   - Best performance: Communication (8.5/10)
   - Area to improve: System Design (6.5/10)
   - Detailed report link: PDF download

**Question Generation:**
- Claude API generates role-specific questions
- Questions vary: Technical, behavioral, situational
- Questions updated: Periodically for freshness
- Question examples:
  * "Tell me about a time you optimized a slow query"
  * "How would you design a scalable microservice?"
  * "Tell me about your experience leading a team"

**Specs:**
- Questions: Generated by Claude API (20+ per role)
- Feedback: Real-time Claude API analysis
- Video: Optional (face detection, emotion analysis — future)
- Export: PDF report with scores and feedback

---

#### 5.1.9 Real-Time Alerts

**Smart Job Alerts:**
- Alert criteria: Skills, location, experience level, salary range
- Alert frequency: Real-time, daily digest, weekly digest (user preference)
- Alert content: Job title, company, match %, why you match

**Alert Notification:**
1. Push notification (if opted in)
2. Email notification (if opted in)
3. In-app notification bell

**Example Alert:**
> "🔥 New Job: Senior Python Engineer at TechCorp
> 
> 87% match because: Python (Advanced) • AWS • Leadership
> 
> [View Job] [Apply] [Not Interested]"

**Alert Preferences:**
- Enable/disable all alerts
- Choose notification channels: Push, Email, In-app
- Set alert frequency: Real-time, Daily, Weekly
- Manage alert rules: Add/edit skill preferences

**Specs:**
- Alert trigger: When new job is posted and matches profile
- Matching algorithm: Claude API semantic scoring
- Delivery: Background job (Bull queue)
- Email template: Branded, mobile-responsive
- Smart skip: Don't alert if candidate already applied

---

#### 5.1.10 Dashboard & Home

**Candidate Dashboard:**
- Welcome message: "Hi Aarav, here's what's new"
- Recommended jobs: Grid of 4-8 jobs (personalized)
- Application stats:
  * Applications: 12
  * Interview scheduled: 2
  * Offers: 1
- Recent applications: Table of last 5 applications
- Saved jobs: Quick link to saved jobs list
- Interview prep CTA: "Prepare for upcoming interviews"
- Profile completeness: Meter + "Complete profile" CTA
- Live counter: "12,450 candidates onboarded" (animated counter)

**Specs:**
- Personalization: ML-based recommendations (future)
- Refresh rate: Real-time, refresh every 30 seconds
- Analytics: Track dashboard engagement

---

### 5.2 Recruiter Features

#### 5.2.1 Recruiter Onboarding

**Company Setup:**
1. Company name input
2. Industry dropdown: Tech, Finance, Healthcare, etc.
3. Company size: Startup (1-50), Scale-up (50-500), Enterprise (500+)
4. Website URL
5. Company logo upload
6. About company: Short description (2-3 lines)
7. HQ location: City + country

**Subscription Selection:**
- Plan options:
  * **Starter:** ₹5,000/month - 5 job posts, basic filtering, 500 candidate searches
  * **Professional:** ₹15,000/month - Unlimited job posts, AI matching, resume DB access, 10 team members
  * **Enterprise:** Custom pricing - Dedicated support, API access, SSO, white-label options
- Payment: Razorpay integration (card, UPI, netbanking)
- Billing cycle: Monthly, quarterly, annual (yearly = 15% discount)
- Promo code: Apply discount code
- Invoice generation: Auto-generated after payment

**Specs:**
- Payment gateway: Razorpay secure integration
- Invoice delivery: Email immediately
- Subscription management: Upgrade/downgrade anytime
- Billing history: View all past invoices

---

#### 5.2.2 Recruiter Dashboard

**Dashboard Overview:**
- Quick stats (4 cards):
  * Jobs Posted: 5 (+ trend indicator)
  * Applications Received: 42 (+ trend)
  * To Interview: 8 (+ calendar icon)
  * Hired: 2 (+ checkmark)

- My Recent Jobs table:
  * Columns: Job Title, Applications, Views, Status, Posted, Actions
  * Each row: Edit, Close, View Analytics buttons
  * Status badge: Active (green), Closed (gray)
  * Hover action: Quick preview

- Applications Overview (Kanban):
  * Column 1: New (12 applications)
  * Column 2: Screening (8)
  * Column 3: Interview (4)
  * Column 4: Offer (2)
  * Drag-drop: Move applications (visual, no backend action)

- Analytics widget: Time-to-hire chart (line graph, 30-day trend)

**Specs:**
- Refresh rate: Real-time
- Charts: Interactive, exportable
- Stats: Auto-calculated from data

---

#### 5.2.3 Job Posting

**Post New Job Form (Multi-step):**

**Step 1: Basic Information**
- Job Title (required)
- Job Category dropdown (Software Development, Design, Sales, etc.)
- Experience Level (Junior, Mid, Senior, Lead)
- Job Type (Full-time, Part-time, Contract, Internship)
- Location (City dropdown or Remote toggle)
- Salary Range (optional): From ₹ ___, To ₹ ___

**Step 2: Job Details**
- Job Description (rich text editor, 200-2000 characters)
- Key Responsibilities (add multiple, bullet list)
- Company Benefits (checkboxes: Health insurance, Remote work, etc.)
- Work Schedule (9-5, Flexible, Shift-based)

**Step 3: Requirements**
- Required Skills (searchable multi-select: Python, AWS, PostgreSQL, etc.)
- Nice-to-have Skills (multi-select)
- Years of Experience (slider, 0-20 years)
- Education Level (High school, Bachelor's, Master's, PhD)

**Step 4: AI Assist**
- AI generates job description: Based on inputs, Claude API creates polished description
- AI generates interview questions: 20+ role-specific questions
- Candidate match estimate: "~500 candidates match this job"
- Accept or regenerate options

**Step 5: Review & Publish**
- Review all entered data
- Billing section: Show subscription plan + cost
  * Plan: Professional (₹15,000/month)
  * Cost per job: ₹500/week
  * Duration: 4 weeks
  * Total: ₹2,000
- Promo code: Apply discount
- Publish buttons: "Publish & Pay", "Publish & Pay Later"

**Specs:**
- AI integration: Claude API for description + questions
- Form validation: Required fields flagged
- Auto-save: Draft saved every 30 seconds
- Multi-step UX: Progress indicator, back/next navigation

---

#### 5.2.4 Candidate Database Search

**Candidate Search Page:**
- Search bar: Full-text search (name, skills, experience)
- Filters:
  * Skills: Multi-select (Python, AWS, React, etc.)
  * Experience: Slider (0-20 years)
  * Location: Multi-select cities
  * Salary expectations: Slider (₹5L - ₹100L)
  * Availability: Immediate, 1-2 weeks, 2-4 weeks
  * Notice period: 0 days, 1-2 weeks, 1 month, etc.
- Results: Grid of candidate cards

**Candidate Card:**
- Profile picture (small, 40x40)
- Name (16px, bold)
- Headline: Professional summary
- Location + skills tags
- Match % to current job post (if viewing from job)
- View profile link: Expand full profile
- Quick actions: Message, Schedule interview, Add to job
- Profile preview: Hover shows extended info

**Specs:**
- Search: Elasticsearch full-text + PostgreSQL filters
- Results pagination: 20 candidates per page
- Search latency: <200ms
- Access control: Only candidates who opted in for recruiter contact

---

#### 5.2.5 Application Management

**Applications Dashboard (Kanban):**

**Column 1: "New"**
- Newly received applications
- Show: Candidate name, job title, applied date
- Actions: Schedule interview, send message, move to screening

**Column 2: "Screening"**
- Applications under review
- Show: Candidate, job, screening status
- Actions: Send feedback, schedule interview, reject, move to interview

**Column 3: "Interview"**
- Scheduled interviews
- Show: Candidate, interview date/time, video call link
- Actions: Join interview, reschedule, move to offer/reject

**Column 4: "Offer"**
- Candidates offered positions
- Show: Candidate, salary offered, offer date
- Actions: Send offer letter, track acceptance, move to hired

**Drag-Drop:**
- Drag applications between columns (visual only, non-functional in MVP)
- Drag triggers action: Move to next stage

**Specs:**
- Real-time updates: WebSocket-powered
- Status persistence: Saved to database
- Actions: Modal popups for actions

---

#### 5.2.6 Interview Scheduling

**Schedule Interview Flow:**
1. Select candidate from applications
2. Select interview type: Technical, HR, Behavioral, 1:1
3. Select interviewer: Dropdown of team members
4. Pick date/time: Calendar widget + time selector
5. Interview link: Auto-generate Zoom/Google Meet link (future, use manual link for now)
6. Send invite: Auto-populate candidate email

**Interview Details:**
- Candidate name
- Job title
- Scheduled time: Date + time (with timezone)
- Interviewer details: Name, email
- Video link: Zoom/Google Meet (auto-generated, future)
- Interview notes: Textarea for pre-interview notes

**Candidate Notification:**
- Email: Scheduled interview details + calendar invite
- Push: Interview reminder 24 hours before
- In-app: Interview scheduled notification

**Specs:**
- Calendar integration: Zoom/Google Calendar (future)
- Timezone handling: Show in candidate's timezone
- Auto-reminders: 24 hours before, 1 hour before
- Rescheduling: Candidate can request reschedule (future)

---

#### 5.2.7 Offer Letter Generation

**Offer Letter Flow:**
1. Select candidate from applications
2. Enter offer details:
   - Position: Job title (auto-filled)
   - Salary: Annual (auto-filled from job post)
   - Joining date: Date picker
   - Benefits: Checklist (Health insurance, etc.)
   - Terms: 3-month probation, etc.
3. AI generates offer letter: Claude API creates polished offer letter
4. Review: Edit offer letter text
5. Send: Email to candidate as PDF + link to accept/decline

**Offer Letter Template:**
- Header: Company logo, candidate name, date
- Body: Position, salary, benefits, joining date, terms
- Footer: Authorized signature line, company contact

**Candidate Acceptance:**
- Email link: Accept offer or decline
- Status updates: Sync to recruiter dashboard

**Specs:**
- AI generation: Claude API (customizable templates)
- PDF export: Sendable as email attachment
- Version control: Save multiple offer versions
- E-signature: Optional (future, for compliance)

---

#### 5.2.8 Team Management

**Team Members Page:**
- List of team members: Name, email, role, permissions
- Roles: Admin, Recruiter, Screener (different permission levels)
- Add team member: Invite by email
- Remove member: Archive (soft delete)
- Permissions:
  * Admin: Full access to everything
  * Recruiter: Can post jobs, manage applications, schedule interviews
  * Screener: Can only view and screen applications

**Specs:**
- Invitations: Email-based
- Activation: New members set password on first login
- Audit log: Track who did what (future)

---

#### 5.2.9 Analytics Dashboard

**Analytics Page:**

**Hiring Metrics:**
- Time-to-hire: Average days from job post to offer accepted
- Source analytics: Uddaya vs. other sources (pie chart)
- Job fill rate: % of jobs filled within 30 days
- Offer acceptance rate: % of offers accepted

**Charts:**
- Time-to-hire trend: Line chart, 30-day view
- Application funnel: Applied → Screening → Interview → Offer → Hired
- Skills in high demand: Which skills have most applications
- Salary trends: Average salary offered by role

**Export:**
- Download as PDF report
- Download as CSV data
- Email weekly digest: Auto-send analytics every Sunday

**Specs:**
- Data: Auto-calculated from application records
- Refresh: Daily updates
- Visualization: Recharts (React charting library)

---

#### 5.2.10 Billing & Subscription

**Billing Page:**
- Current plan: Show active subscription
- Usage: X jobs posted this month, Y candidates searched
- Payment method: Saved cards, UPI, etc.
- Billing history: List of past invoices + download
- Upgrade/downgrade: Change subscription tier
- Cancel subscription: Option to cancel (with feedback)

**Specs:**
- Razorpay integration: Secure payment processing
- Auto-renewal: Subscription auto-renews on due date
- Invoices: Auto-generated and emailed
- Dunning: Retry payment if failed

---

### 5.3 Admin Features

#### 5.3.1 Platform Dashboard

**Overview:**
- Total users: Active candidates + recruiters
- Total jobs posted: Month-to-date
- Total applications: Month-to-date
- GMV (Gross Monetization Value): Revenue this month
- Active subscriptions: Number of paid recruiters

#### 5.3.2 User Management

**Admin User List:**
- Search by name, email, company
- Filter: Candidates, Recruiters, Both
- Status: Active, Suspended, Deleted
- Actions: View profile, suspend, delete, send message

#### 5.3.3 Moderation & Safety

**Spam Detection:**
- Auto-flagged profiles: AI-detected spam
- Manual flagging: Admins flag suspicious content
- Review queue: Suspicious profiles pending review
- Actions: Approve, reject (remove), message user

**Dispute Resolution:**
- Report handling: Review user complaints
- Resolution: Investigate and take action
- Audit log: Track all moderator actions

#### 5.3.4 Analytics & Reporting

**Platform Analytics:**
- User growth: DAU, WAU, MAU trends
- Recruitment metrics: Time-to-hire, job fill rate
- Revenue metrics: MRR, ARR, churn rate
- Engagement: Session duration, feature usage

**Export:**
- Download analytics as PDF report
- Download data as CSV

---

## 6. Technical Requirements

### 6.1 Technology Stack

**Frontend:**
- **Framework:** Next.js 14+ (React 18)
- **Language:** TypeScript
- **Styling:** TailwindCSS + Shadcn UI
- **State Management:** Zustand
- **Server State:** React Query (TanStack Query)
- **Forms:** React Hook Form
- **Charts:** Recharts
- **Real-time:** Socket.IO client
- **Icons:** Lucide React
- **Testing:** Jest + React Testing Library

**Backend:**
- **Runtime:** Node.js 18+
- **Framework:** Fastify (or Express)
- **Language:** TypeScript
- **ORM:** Prisma
- **Authentication:** NextAuth.js + JWT
- **API Gateway:** Express middleware or Fastify plugins
- **Validation:** Zod or Joi
- **Testing:** Jest
- **Logging:** Pino

**Database:**
- **Primary:** PostgreSQL 14+
- **Cache:** Redis 7+
- **Search:** Elasticsearch 8+
- **Vectors:** Pinecone or Weaviate
- **File Storage:** AWS S3

**Background Jobs:**
- **Queue:** Bull (Redis-backed) or RabbitMQ (future)
- **Scheduler:** Node-cron or APScheduler

**AI/ML:**
- **LLM:** Claude API (Anthropic)
- **Embeddings:** OpenAI API (text-embedding-ada-002)
- **Vector DB:** Pinecone or Milvus

**Authentication:**
- **OAuth:** LinkedIn OAuth 2.0
- **Session:** JWT + HTTP-only cookies

**Email & Notifications:**
- **Email:** SendGrid or Resend
- **Push:** Firebase Cloud Messaging (FCM)
- **SMS:** Twilio (future)

**Payments:**
- **Processor:** Razorpay
- **Invoicing:** Custom or Stripe Invoicing

**Deployment & Infrastructure:**
- **Hosting:** Railway, Render, or Heroku
- **Database Hosting:** AWS RDS, Supabase, or managed PostgreSQL
- **CDN:** Cloudflare
- **Monitoring:** Sentry, Datadog, or New Relic
- **Logs:** CloudWatch or LogRocket
- **CI/CD:** GitHub Actions

### 6.2 Performance Requirements

| Metric | Target | Notes |
|--------|--------|-------|
| Page Load | <2s | First Contentful Paint |
| API Response | <200ms | p95 latency |
| Database Query | <100ms | p95 latency |
| Search Latency | <200ms | Full-text + semantic |
| Concurrent Users | 10,000 | Peak capacity |
| Uptime | 99.5% | Monthly SLA |
| CDN Cache Hit | 80%+ | Static assets |

### 6.3 Security Requirements

- **SSL/TLS:** HTTPS everywhere
- **Authentication:** OAuth 2.0 + JWT
- **Password:** Bcrypt hashing (10+ rounds)
- **Data Encryption:** AES-256 for sensitive data
- **API Security:** Rate limiting, CORS, CSRF tokens
- **Secrets Management:** Environment variables, AWS Secrets Manager
- **OWASP Top 10:** Compliance with OWASP standards
- **GDPR:** Data privacy, right to deletion, data portability
- **Audit Logs:** Track all admin actions

### 6.4 Scalability & Architecture

**Horizontal Scaling:**
- Stateless API servers: Multiple instances behind load balancer
- Database replication: Read replicas for scaling reads
- Cache layer: Redis cluster for session/data caching
- Search scaling: Elasticsearch cluster with shards

**Microservices (Future):**
- Job Service: Job posting, management
- Candidate Service: Profile, applications
- Matching Service: AI matching, recommendations
- Notification Service: Email, push, SMS
- Payment Service: Subscriptions, invoicing

**Message Queue:**
- Email jobs: Async email sending
- Resume parsing: Background resume analysis
- Alert generation: Batch alert processing
- Analytics: Async analytics calculation

---

## 7. Database Schema

### 7.1 Core Tables

```sql
-- Users (Candidates & Recruiters combined)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  role ENUM('candidate', 'recruiter', 'admin') NOT NULL,
  phone VARCHAR(20),
  location VARCHAR(255),
  profile_image_url TEXT,
  linkedin_id VARCHAR(255) UNIQUE,
  linkedin_data JSONB,
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Candidates (extends users)
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  headline VARCHAR(255),
  bio TEXT,
  total_experience_years INT,
  current_company VARCHAR(255),
  current_title VARCHAR(255),
  salary_expectation_min INT,
  salary_expectation_max INT,
  notice_period VARCHAR(50),
  availability VARCHAR(50),
  preferred_locations JSONB,
  willing_to_relocate BOOLEAN DEFAULT FALSE,
  profile_completion_score INT DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidate Skills
CREATE TABLE candidate_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  skill_name VARCHAR(255) NOT NULL,
  proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
  years_of_experience INT,
  endorsement_count INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recruiters (extends users)
CREATE TABLE recruiters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  is_company_admin BOOLEAN DEFAULT FALSE,
  hiring_role VARCHAR(255),
  department VARCHAR(255),
  can_post_jobs BOOLEAN DEFAULT TRUE,
  can_manage_applications BOOLEAN DEFAULT TRUE,
  can_schedule_interviews BOOLEAN DEFAULT TRUE,
  can_send_offers BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  website VARCHAR(255),
  industry VARCHAR(255),
  company_size ENUM('1-50', '51-200', '201-1000', '1000+') DEFAULT '51-200',
  logo_url TEXT,
  description TEXT,
  location VARCHAR(255),
  hq_country VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions (for recruiters)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL UNIQUE REFERENCES recruiters(id) ON DELETE CASCADE,
  plan_type ENUM('starter', 'professional', 'enterprise') NOT NULL,
  status ENUM('active', 'canceled', 'expired') DEFAULT 'active',
  price_monthly INT NOT NULL,
  billing_cycle ENUM('monthly', 'quarterly', 'annual') DEFAULT 'monthly',
  jobs_limit INT,
  candidate_search_limit INT,
  team_members_limit INT,
  is_auto_renew BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  canceled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(255),
  experience_level ENUM('junior', 'mid', 'senior', 'lead') NOT NULL,
  job_type ENUM('full-time', 'part-time', 'contract', 'internship') DEFAULT 'full-time',
  location VARCHAR(255) NOT NULL,
  is_remote BOOLEAN DEFAULT FALSE,
  salary_min INT,
  salary_max INT,
  salary_currency VARCHAR(10) DEFAULT 'INR',
  is_salary_visible BOOLEAN DEFAULT FALSE,
  status ENUM('draft', 'active', 'closed', 'filled') DEFAULT 'active',
  work_schedule VARCHAR(255),
  company_benefits JSONB,
  required_skills JSONB NOT NULL,
  nice_to_have_skills JSONB,
  years_of_experience_required INT,
  education_level VARCHAR(255),
  ai_generated_description TEXT,
  ai_generated_questions JSONB,
  posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status ENUM('applied', 'screening', 'interview', 'offer', 'hired', 'rejected') DEFAULT 'applied',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  match_score INT,
  match_explanation TEXT,
  resume_id UUID REFERENCES resumes(id),
  is_withdrawn BOOLEAN DEFAULT FALSE,
  withdrawn_at TIMESTAMP,
  last_status_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(candidate_id, job_id)
);

-- Resumes
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_size INT,
  file_name VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  parsed_data JSONB,
  extracted_skills JSONB,
  extracted_experience JSONB,
  extracted_education JSONB,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts (Smart job alerts for candidates)
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  alert_type ENUM('new_job_match', 'application_update', 'message') DEFAULT 'new_job_match',
  match_score INT,
  message TEXT,
  is_sent BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages (Recruiter ↔ Candidate communication)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID NOT NULL REFERENCES users(id),
  job_id UUID REFERENCES jobs(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interviews
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  interview_type ENUM('technical', 'hr', 'behavioral', 'final') DEFAULT 'technical',
  scheduled_at TIMESTAMP NOT NULL,
  conducted_at TIMESTAMP,
  interviewer_id UUID REFERENCES users(id),
  video_link TEXT,
  notes TEXT,
  feedback_score INT,
  feedback_text TEXT,
  status ENUM('scheduled', 'completed', 'rescheduled', 'cancelled') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offers
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  position VARCHAR(255) NOT NULL,
  salary_annual INT NOT NULL,
  joining_date DATE NOT NULL,
  benefits JSONB,
  terms_and_conditions TEXT,
  offer_letter_url TEXT,
  status ENUM('draft', 'sent', 'accepted', 'declined', 'expired') DEFAULT 'draft',
  sent_at TIMESTAMP,
  accepted_at TIMESTAMP,
  declined_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved Jobs
CREATE TABLE saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  list_name VARCHAR(255),
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(candidate_id, job_id)
);

-- Live Counter (for real-time onboarded candidates count)
CREATE TABLE live_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counter_type VARCHAR(50) NOT NULL UNIQUE,
  current_count INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mock Interviews (for interview prep feature)
CREATE TABLE mock_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id),
  role_type VARCHAR(255) NOT NULL,
  difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  duration_minutes INT DEFAULT 15,
  score_overall NUMERIC(3,1),
  score_clarity NUMERIC(3,1),
  score_technical NUMERIC(3,1),
  score_communication NUMERIC(3,1),
  feedback TEXT,
  transcript_url TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments (for subscription payments)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  razorpay_payment_id VARCHAR(255) UNIQUE,
  amount INT NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(255),
  invoice_url TEXT,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7.2 Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_linkedin_id ON users(linkedin_id);
CREATE INDEX idx_candidates_user_id ON candidates(user_id);
CREATE INDEX idx_recruiters_user_id ON recruiters(user_id);
CREATE INDEX idx_jobs_recruiter_id ON jobs(recruiter_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_resumes_candidate_id ON resumes(candidate_id);
CREATE INDEX idx_alerts_candidate_id ON alerts(candidate_id);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_interviews_application_id ON interviews(application_id);
CREATE INDEX idx_offers_application_id ON offers(application_id);
CREATE INDEX idx_saved_jobs_candidate_id ON saved_jobs(candidate_id);

-- Full-text search indexes
CREATE INDEX idx_jobs_search ON jobs USING GIN(to_tsvector('english', title || ' ' || description || ' ' || array_to_string(required_skills, ',')));
CREATE INDEX idx_candidates_search ON candidates USING GIN(to_tsvector('english', bio));
```

---

## 8. API Specification

### 8.1 Authentication Endpoints

#### POST /api/auth/signup
**Description:** Candidate email signup

**Request Body:**
```json
{
  "email": "sairam@email.com",
  "password": "SecurePass123!",
  "name": "Sairam Kumar"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "sairam@email.com",
    "name": "Sairam Kumar",
    "role": "candidate"
  },
  "token": "jwt_token"
}
```

#### POST /api/auth/login
**Description:** Login with email & password

**Request Body:**
```json
{
  "email": "sairam@email.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... },
  "token": "jwt_token"
}
```

#### GET /api/auth/linkedin
**Description:** LinkedIn OAuth redirect URL

**Response:**
```json
{
  "url": "https://www.linkedin.com/oauth/v2/authorization?..."
}
```

#### POST /api/auth/linkedin/callback
**Description:** Handle LinkedIn OAuth callback

**Query Params:** `code`, `state`

**Response:**
```json
{
  "success": true,
  "user": { ... },
  "token": "jwt_token"
}
```

---

### 8.2 Candidate Endpoints

#### GET /api/candidates/me
**Description:** Get current candidate profile

**Headers:** `Authorization: Bearer token`

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "headline": "Senior Python Engineer",
  "bio": "...",
  "skills": [ { "name": "Python", "level": "advanced" } ],
  "experience": [ ... ],
  "education": [ ... ],
  "profile_completion_score": 85
}
```

#### PUT /api/candidates/me
**Description:** Update candidate profile

**Request Body:**
```json
{
  "headline": "Senior Python Engineer | AWS Architect",
  "bio": "...",
  "location": "Hyderabad, India",
  "salary_expectation_min": 2000000,
  "salary_expectation_max": 3000000
}
```

#### GET /api/jobs
**Description:** Search jobs with filters

**Query Params:**
- `q`: Search query
- `location`: Location filter
- `experience`: Experience level
- `salary_min`, `salary_max`: Salary range
- `limit`: 20 (default)
- `offset`: 0 (default)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "job-uuid",
      "title": "Senior Python Engineer",
      "company": "TechCorp",
      "location": "Bangalore",
      "salary_min": 2000000,
      "salary_max": 3000000,
      "match_score": 87,
      "match_reason": "Python (Advanced) • AWS • Leadership"
    }
  ],
  "total": 1250,
  "limit": 20,
  "offset": 0
}
```

#### GET /api/jobs/:id
**Description:** Get job detail with match explanation

**Response:**
```json
{
  "id": "job-uuid",
  "title": "Senior Python Engineer",
  "description": "...",
  "company": { ... },
  "match_score": 87,
  "match_explanation": {
    "score": 87,
    "reasons": [
      { "skill": "Python", "candidate_level": "advanced", "job_level": "advanced", "match": true },
      { "skill": "AWS", "candidate_level": "advanced", "job_level": "advanced", "match": true }
    ]
  }
}
```

#### POST /api/applications
**Description:** Apply for a job

**Request Body:**
```json
{
  "job_id": "job-uuid",
  "resume_id": "resume-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "application": {
    "id": "app-uuid",
    "candidate_id": "cand-uuid",
    "job_id": "job-uuid",
    "status": "applied",
    "applied_at": "2026-09-29T10:00:00Z"
  }
}
```

#### GET /api/applications
**Description:** Get candidate's applications

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "app-uuid",
      "job": { ... },
      "status": "applied",
      "applied_at": "2026-09-29T10:00:00Z"
    }
  ]
}
```

#### POST /api/mock-interviews
**Description:** Start mock interview

**Request Body:**
```json
{
  "job_id": "job-uuid",
  "role_type": "technical",
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "interview_id": "interview-uuid",
  "questions": [
    { "id": 1, "text": "Tell me about your Python experience" },
    { "id": 2, "text": "How would you design a scalable system?" }
  ],
  "total_questions": 5
}
```

#### POST /api/mock-interviews/:id/submit-answer
**Description:** Submit answer to mock interview question

**Request Body:**
```json
{
  "question_id": 1,
  "answer_text": "I have 5 years of Python experience..."
}
```

**Response:**
```json
{
  "success": true,
  "feedback": {
    "clarity_score": 8,
    "technical_score": 7,
    "communication_score": 8,
    "feedback_text": "Great answer! You explained the problem well..."
  }
}
```

---

### 8.3 Recruiter Endpoints

#### POST /api/jobs
**Description:** Create new job posting

**Request Body:**
```json
{
  "title": "Senior Python Engineer",
  "description": "We are looking for...",
  "category": "Software Development",
  "experience_level": "senior",
  "job_type": "full-time",
  "location": "Bangalore",
  "salary_min": 2000000,
  "salary_max": 3000000,
  "required_skills": ["Python", "AWS", "PostgreSQL"],
  "nice_to_have_skills": ["Kubernetes"],
  "years_of_experience": 5
}
```

**Response:**
```json
{
  "success": true,
  "job": {
    "id": "job-uuid",
    "status": "active",
    "created_at": "2026-09-29T10:00:00Z"
  }
}
```

#### GET /api/recruiters/me/applications
**Description:** Get all applications for recruiter's jobs

**Query Params:**
- `status`: Filter by status (applied, screening, interview, offer, hired)
- `job_id`: Filter by job ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "app-uuid",
      "candidate": { ... },
      "job": { ... },
      "status": "applied",
      "match_score": 87,
      "applied_at": "2026-09-29T10:00:00Z"
    }
  ]
}
```

#### POST /api/applications/:id/schedule-interview
**Description:** Schedule interview for application

**Request Body:**
```json
{
  "interview_type": "technical",
  "scheduled_at": "2026-10-05T14:00:00Z",
  "interviewer_id": "recruiter-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "interview": {
    "id": "interview-uuid",
    "scheduled_at": "2026-10-05T14:00:00Z"
  }
}
```

#### POST /api/applications/:id/send-offer
**Description:** Generate and send offer letter

**Request Body:**
```json
{
  "position": "Senior Python Engineer",
  "salary": 2500000,
  "joining_date": "2026-11-01",
  "benefits": ["Health Insurance", "Remote Work"],
  "terms": "3-month probation period"
}
```

**Response:**
```json
{
  "success": true,
  "offer": {
    "id": "offer-uuid",
    "status": "sent",
    "offer_letter_url": "https://..."
  }
}
```

---

### 8.4 Admin Endpoints

#### GET /api/admin/dashboard
**Description:** Platform overview stats

**Response:**
```json
{
  "total_users": 15000,
  "total_candidates": 12000,
  "total_recruiters": 2000,
  "total_jobs": 5000,
  "total_applications": 45000,
  "gmv_this_month": 750000
}
```

---

## 9. Integration Specifications

### 9.1 LinkedIn OAuth 2.0

**Flow:**
1. User clicks "Sign up with LinkedIn"
2. Redirect to LinkedIn authorization URL
3. User logs in on LinkedIn
4. LinkedIn redirects back to Uddaya with authorization code
5. Backend exchanges code for access token
6. Fetch user profile data (name, email, experience, skills)
7. Create/update user in database

**Endpoints:**
- Authorization: `https://www.linkedin.com/oauth/v2/authorization`
- Token: `https://www.linkedin.com/oauth/v2/accessToken`
- Profile: `https://api.linkedin.com/v2/me`

**Scopes:**
- `openid`
- `profile`
- `email`

---

### 9.2 Claude API Integration

**Use Case 1: Job Matching**
```
Prompt: "Rate how well this candidate matches this job from 0-100."
Inputs: Candidate profile, Job description
Output: Match score (0-100) + explanation
```

**Use Case 2: Resume Parsing**
```
Prompt: "Extract structured data from this resume (skills, experience, education)."
Inputs: Resume text
Output: JSON (skills[], experience[], education[])
```

**Use Case 3: Mock Interview**
```
Prompt: "Generate 20 interview questions for a [role] position."
Inputs: Job role, company, skills
Output: JSON (questions[], difficulty[])
```

**Use Case 4: Interview Feedback**
```
Prompt: "Evaluate this interview answer on clarity, technical depth, communication."
Inputs: Question, candidate answer
Output: JSON (clarity_score, technical_score, communication_score, feedback)
```

---

### 9.3 Razorpay Payment Integration

**Payment Flow:**
1. User selects subscription plan
2. Backend creates Razorpay order
3. Frontend loads Razorpay payment form
4. User pays via card, UPI, netbanking
5. Razorpay webhook notifies backend of payment status
6. Backend updates subscription status
7. Send invoice to user email

**Webhook Events:**
- `payment.authorized`
- `payment.failed`
- `subscription.activated`

---

### 9.4 SendGrid Email Integration

**Email Types:**
1. **Welcome Email:** Sent on signup
2. **Job Alert Email:** New job matches
3. **Interview Scheduled:** Interview reminder
4. **Offer Letter:** Generated offer as PDF
5. **Weekly Digest:** Candidate activity summary

**Email Templates:** Branded, mobile-responsive

---

### 9.5 AWS S3 Integration

**Resume Storage:**
- Bucket: `uddaya-resumes`
- File naming: `{candidate_id}/{file_name}`
- Expiration: Keep indefinitely
- Access: Private (signed URLs)

---

### 9.6 Elasticsearch Integration

**Indexing:**
- Index: `jobs`, `candidates`
- Fields: title, description, skills, location
- Analyzer: Standard + custom stemmer

**Query:**
```json
{
  "query": {
    "multi_match": {
      "query": "python engineer",
      "fields": ["title", "description", "skills"]
    }
  }
}
```

---

### 9.7 Pinecone Vector DB Integration

**Vectors:**
- Model: `text-embedding-ada-002` (OpenAI)
- Dimension: 1536
- Metric: cosine

**Namespace:** `jobs`, `candidates`

**Query:**
```
Vector similarity search for job-candidate matching
```

---

## 10. 12-Week Development Timeline

### Phase 1: Foundation (Weeks 1-4)

**Week 1-2: Project Setup & Infrastructure**
- [ ] GitHub repo setup
- [ ] Next.js project initialization
- [ ] PostgreSQL database setup
- [ ] Environment configuration
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Deployment setup (Railway/Render)
- **Deliverable:** Project running locally + deployed staging env

**Week 2-3: Authentication & Basic UI**
- [ ] Email signup/login endpoints
- [ ] LinkedIn OAuth integration
- [ ] NextAuth.js setup
- [ ] Landing page design & build
- [ ] Login/signup pages
- [ ] Forgot password flow
- **Deliverable:** Full auth flow working, users can sign up

**Week 3-4: Candidate Onboarding**
- [ ] Profile setup form (multi-step)
- [ ] Resume upload to S3
- [ ] Resume parsing (Claude API)
- [ ] Skills extraction
- [ ] Profile dashboard (basic)
- **Deliverable:** Candidates can complete profile, upload resume

---

### Phase 2: Core Features (Weeks 5-8)

**Week 5-6: Job Posting & Search**
- [ ] Job posting form (multi-step)
- [ ] Elasticsearch indexing
- [ ] Job search page with filters
- [ ] Job detail page
- [ ] Job management (recruiter dashboard)
- [ ] Subscription system (Razorpay)
- **Deliverable:** Recruiters can post jobs, candidates can search

**Week 7-8: Applications & Matching**
- [ ] Application submission flow
- [ ] Job-candidate semantic matching (Claude API + Pinecone)
- [ ] Match score display
- [ ] Applications dashboard (Kanban view)
- [ ] Application status tracking
- [ ] Email notifications
- **Deliverable:** Full application workflow, smart matching working

---

### Phase 3: AI Features (Weeks 9-11)

**Week 9-10: Mock Interview Bot**
- [ ] Interview question generation (Claude API)
- [ ] Interview UI (question display, timer, input)
- [ ] Answer evaluation (Claude API feedback)
- [ ] Feedback display
- [ ] Interview completion report
- [ ] Export interview summary
- **Deliverable:** Candidates can take mock interviews with AI feedback

**Week 11: Smart Alerts & Real-time Features**
- [ ] Smart alert system (match new jobs to candidate profiles)
- [ ] Real-time counter (live candidates onboarded)
- [ ] WebSocket integration for real-time updates
- [ ] Alert preferences UI
- [ ] Email/push notifications for alerts
- [ ] Alert history
- **Deliverable:** Real-time alerts working, live counter displaying

---

### Phase 4: Polish & Launch (Week 12)

**Week 12: Testing, Optimization & Launch**
- [ ] End-to-end testing (manual + automated)
- [ ] Performance optimization (page load <2s)
- [ ] Security audit (OWASP, GDPR)
- [ ] Bug fixes
- [ ] Mobile responsiveness testing
- [ ] Admin dashboard basic features
- [ ] User documentation
- [ ] Beta launch (50-100 users)
- [ ] Public launch
- **Deliverable:** MVP live, publicly accessible, ready for users

---

## 11. Launch Strategy

### MVP Scope (Public Launch, Week 12)

**Candidate Side:**
- ✅ Email signup & LinkedIn OAuth
- ✅ Profile setup & resume upload
- ✅ Job search with filters
- ✅ Job applications
- ✅ Application tracking
- ✅ Mock interviews (basic)
- ✅ Smart job alerts
- ✅ Saved jobs

**Recruiter Side:**
- ✅ Email signup
- ✅ Company setup
- ✅ Subscription (Razorpay)
- ✅ Post jobs
- ✅ Search candidates
- ✅ Manage applications
- ✅ Schedule interviews
- ✅ Dashboard & analytics (basic)

**Admin Side:**
- ✅ Platform overview
- ✅ User management (basic)
- ✅ Moderation & spam detection

**Not in MVP (Post-launch features):**
- ❌ Offer letter generation
- ❌ Agentic recruiter automation
- ❌ Advanced analytics
- ❌ Mobile app
- ❌ Video interviews
- ❌ Skill verification
- ❌ Enterprise SSO

### Go-to-Market Strategy

**Phase 1: Soft Launch (Week 11)**
- Invite 5-10 recruiter partners (manual onboarding)
- Invite 100-500 candidate beta testers
- Collect feedback, iterate

**Phase 2: Public Launch (Week 12)**
- Public website announcement
- LinkedIn/Twitter announcement
- Tech community outreach (DEV.to, Twitter Dev)
- Email outreach to recruiter contacts

**Phase 3: Growth (Month 2-3)**
- Content marketing (blog on job trends)
- SEO optimization
- Referral program (credit for referring recruiters)
- Partnership outreach (HR platforms, education)

---

## 12. Success Metrics & KPIs

### Acquisition Metrics

| Metric | Target (Month 3) | Target (Month 6) |
|--------|------------------|------------------|
| Candidate signups | 10,000 | 50,000 |
| Active candidates | 5,000 | 25,000 |
| Recruiter signups | 500 | 2,000 |
| Paid recruiters | 100 | 500 |
| Total jobs posted | 500 | 2,500 |

### Engagement Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| Candidate DAU | 2,000+ | Daily job applicants |
| Candidate session duration | 15+ min | Average session |
| Job applications/candidate | 3+ /week | Application rate |
| Profile completion rate | 80%+ | Filled profiles |
| Interview prep completion | 40%+ | Mock interviews completed |

### Revenue Metrics

| Metric | Target (Month 3) | Target (Month 6) | Target (Year 1) |
|--------|------------------|------------------|-----------------|
| MRR | ₹5L | ₹25L | ₹200L+ |
| ARPU | ₹50,000 | ₹50,000 | ₹50,000 |
| Churn rate | <5% | <3% | <2% |
| CAC payback | <3 months | <2 months | <2 months |

### Quality Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| Match accuracy | 87%+ | Validated by recruiter feedback |
| Time-to-hire reduction | 30%+ | vs. traditional portals |
| Offer acceptance rate | 70%+ | Among recruited candidates |
| User satisfaction | 4.5/5 | NPS >50 |

---

## 13. Dependencies & Risks

### Critical Dependencies

1. **Claude API availability:** If Claude API goes down, matching stops
   - Mitigation: Fallback keyword matching, rate limiting
2. **LinkedIn OAuth stability:** If LinkedIn OAuth breaks, signup halts
   - Mitigation: Email signup as primary, OAuth as secondary
3. **Database performance:** Large dataset performance
   - Mitigation: Indexing strategy, read replicas, caching

### Key Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Low recruiter adoption | Revenue risk | Medium | Free trial, freemium model, recruiter outreach |
| Poor match accuracy | User churn | Medium | Continuous ML refinement, feedback loops |
| Data privacy issues | Legal risk | Low | GDPR compliance, secure storage, audit logs |
| Competition from Naukri | Market share loss | High | Focus on AI differentiation, niche markets (tech first) |
| API costs (Claude) | Operating cost | Medium | Optimize prompts, batch processing, caching |
| Delayed talent acquisition | Timeline risk | Low | Hire experienced tech leads upfront |

---

## 14. Deliverables Checklist

### Code Deliverables
- [ ] GitHub repository with clean commit history
- [ ] Frontend code (Next.js, React, TypeScript)
- [ ] Backend code (Node.js/Fastify, TypeScript)
- [ ] Database migrations & schema
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Test suite (unit + integration tests)
- [ ] CI/CD pipeline configuration
- [ ] Docker configuration (if containerized)

### Documentation
- [ ] Project README
- [ ] Setup & deployment guide
- [ ] API documentation
- [ ] Database schema documentation
- [ ] Architecture diagram
- [ ] Feature specifications
- [ ] User guides (candidate & recruiter)

### Design Assets
- [ ] Figma design files (all screens)
- [ ] Design system (components, colors, typography)
- [ ] Brand guidelines
- [ ] UI mockups (approved)

### DevOps & Infrastructure
- [ ] Staging environment setup
- [ ] Production environment setup
- [ ] Database backup & recovery plan
- [ ] Monitoring & alerting (Sentry, Datadog)
- [ ] SSL/TLS certificates
- [ ] Email configuration (SendGrid)
- [ ] S3 bucket configuration
- [ ] CDN setup (Cloudflare)

### Analytics & Monitoring
- [ ] Analytics dashboard (user, engagement, revenue)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Datadog)
- [ ] Security logs (audit trail)

---

## 15. Budget Estimate

### Development (12 weeks, ₹33 lakhs)

| Role | Count | Cost/week | Duration | Total |
|------|-------|-----------|----------|-------|
| Tech Lead | 1 | ₹75,000 | 12 weeks | ₹9L |
| Full-stack Dev | 2 | ₹50,000 each | 12 weeks | ₹12L |
| Frontend Dev | 1 | ₹40,000 | 12 weeks | ₹4.8L |
| DevOps/Infra | 1 | ₹45,000 | 8 weeks | ₹3.6L |
| QA/Tester | 1 | ₹30,000 | 8 weeks | ₹2.4L |
| **Subtotal** | | | | **₹32L** |

### Infrastructure (Monthly, ₹1.3 lakhs)

| Service | Cost |
|---------|------|
| Railway/Render hosting | ₹30,000 |
| PostgreSQL (managed) | ₹15,000 |
| Redis (managed) | ₹10,000 |
| Elasticsearch | ₹20,000 |
| Pinecone vector DB | ₹15,000 |
| AWS S3 storage + transfer | ₹10,000 |
| Cloudflare CDN | ₹5,000 |
| SendGrid (email) | ₹10,000 |
| Razorpay fees (payment processing) | ₹15,000 (from revenue) |
| Monitoring (Sentry/Datadog) | ₹10,000 |
| Miscellaneous | ₹8,000 |
| **Total Monthly** | **₹1.3L** |

### Year 1 Costs

- Development: ₹33L (Weeks 1-12)
- Infrastructure: ₹16L (Year 1, starting Month 4)
- Contingency (15%): ₹7.5L
- **Total Year 1:** ₹56.5L

---

## 16. Success Criteria by Phase

### MVP (Month 1, Week 12)

**Must Have:**
- ✅ 1,000+ candidate signups
- ✅ 50+ jobs posted
- ✅ 200+ applications
- ✅ Zero critical bugs
- ✅ <2s page load time
- ✅ 99%+ uptime

**Nice to Have:**
- ✅ Mock interview feature
- ✅ Smart matching accuracy 80%+
- ✅ Real-time alerts

**Failure Criteria:**
- ❌ <500 signups
- ❌ >5s page load
- ❌ <80% uptime
- ❌ Critical security vulnerabilities

---

### Month 2-3 (Growth Phase)

**Targets:**
- 10,000 candidates onboarded
- 100 paid recruiter subscriptions
- ₹5L+ MRR
- 87%+ match accuracy
- 3+ applications/candidate/week
- <25-day time-to-hire

**Success Metrics:**
- DAU >2,000
- Churn <10%
- NPS >40

---

### Month 6 (Scale Phase)

**Targets:**
- 50,000+ candidates
- 500+ paid recruiters
- ₹25L+ MRR
- 500+ jobs posted/month
- 90%+ match accuracy
- 20-day time-to-hire

**Expansion:**
- New job categories beyond tech
- Advanced analytics for recruiters
- Interview automation (scheduling, reminders)

---

## 17. Success Definition

### For Candidates
- Find relevant jobs within 1 week of signup
- Receive interview within 14 days of application
- Improved job match accuracy (87%+) vs. traditional portals
- Successful interview prep (mock interviews completing >40%)

### For Recruiters
- Reduce hiring time by 30% (45 days → 30 days)
- Increase offer acceptance by 20% (from 60% → 80%)
- Screen candidates 5x faster (with AI)
- Save 10+ hours/week on manual screening

### For Platform
- Achieve 99.5% uptime
- Process 1M+ API requests daily
- Support 10,000+ concurrent users
- Maintain <200ms API response time
- Grow MRR to ₹200L+ (Year 1)

---

## Appendix: Quick Reference

### Key Contacts & Resources
- **Claude API Docs:** https://docs.anthropic.com
- **LinkedIn OAuth:** https://www.linkedin.com/developers
- **Razorpay Docs:** https://razorpay.com/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs
- **Elasticsearch Docs:** https://www.elastic.co/guide

### Important URLs (To be updated post-launch)
- **Product:** www.uddaya.com (post-launch)
- **API Docs:** api.uddaya.com/docs
- **Dashboard (Recruiter):** app.uddaya.com
- **Admin Panel:** admin.uddaya.com

### Team Roles (To be assigned)
- **Product Manager:** [Name]
- **Tech Lead:** [Name]
- **Backend Lead:** [Name]
- **Frontend Lead:** [Name]
- **DevOps Lead:** [Name]

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Sept 29, 2026 | Sairam Kumar | Initial PRD created |

---

**Status:** READY FOR ENGINEERING  
**Last Updated:** Sept 29, 2026  
**Next Review:** After Week 4 (Project foundation completion)

---

**End of PRD Document**
