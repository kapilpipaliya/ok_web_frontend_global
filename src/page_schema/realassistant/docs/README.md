# RealAssistant App Documentation

## Overview
RealAssistant is a platform that connects users with real human assistants to solve everyday problems. Users pay a small fee per problem solved, with transparent pricing and a balance-based payment system.

## Database Initialization

Before using RealAssistant, you need to initialize the database with required constraints, roles, and seed data.

### Quick Start

1. **Check initialization status:**
```bash
curl http://localhost:3000/api/realassistant/initialize
```

2. **Initialize RealAssistant (production):**
```bash
curl -X POST http://localhost:3000/api/realassistant/initialize \
  -H "Content-Type: application/json" \
  -d '{}'
```

3. **Initialize with demo data (development):**
```bash
curl -X POST http://localhost:3000/api/realassistant/initialize \
  -H "Content-Type: application/json" \
  -d '{"includeDemoData": true}'
```

### What Initialization Does

1. **Creates Database Constraints & Indexes:**
   - Unique constraints for all RA node types
   - Performance indexes for common queries
   - Located in: `src/cypher/mutate/realassistant/constraints.ts`

2. **Seeds Initial Data:**
   - Creates 3 RealAssistant roles (Customer, Assistant, Admin)
   - Creates 9 problem categories with pricing
   - Creates 30+ expertise areas
   - Creates 17 RealAssistant-specific permissions
   - Located in: `src/cypher/mutate/realassistant/seedData.ts`

3. **Migrates Existing Users:**
   - Adds RA-prefixed properties to User nodes
   - Assigns default Customer role to existing users
   - Calculates profile completion
   - Located in: `src/cypher/mutate/realassistant/migration.ts`

4. **Optional Demo Data:**
   - Creates demo customer: `demo.customer@realassistant.com`
   - Creates demo assistant: `demo.assistant@realassistant.com`
   - Useful for testing and development

### Manual Initialization (Alternative)

If you prefer to run initialization programmatically:

```typescript
import { initializeRealAssistant } from "~/cypher/mutate/realassistant/initialize";

// Basic initialization
await initializeRealAssistant();

// With demo data
await initializeRealAssistant({ includeDemoData: true });

// Skip user migration
await initializeRealAssistant({ skipMigration: true });
```

## Project Structure

```
/src/page_schema/realassistant/
├── docs/
│   ├── README.md (this file)
│   └── graph-schema.md
├── themes/
│   └── RealAssistantTheme.hjson
├── components/
│   ├── RealAssistantHeader.hjson
│   ├── RealAssistantCard.hjson
│   └── RealAssistantButton.hjson
└── pages/
    ├── User Pages
    │   ├── RealAssistantHomePage.hjson
    │   ├── RealAssistantUserDashboard.hjson
    │   ├── RealAssistantProblemSubmission.hjson
    │   ├── RealAssistantProblemDetails.hjson
    │   └── RealAssistantRecharge.hjson
    ├── Assistant Pages
    │   ├── RealAssistantAssistantDashboard.hjson
    │   ├── RealAssistantAssistantSolution.hjson
    │   ├── RealAssistantAssistantEarnings.hjson
    │   ├── RealAssistantAssistantProfile.hjson
    │   └── RealAssistantAssistantAvailability.hjson
    └── Admin Pages
        ├── RealAssistantAdminDashboard.hjson
        ├── RealAssistantAdminUsers.hjson
        ├── RealAssistantAdminProblems.hjson
        ├── RealAssistantAdminTransactions.hjson
        ├── RealAssistantAdminSettings.hjson
        └── RealAssistantAdminReports.hjson
```

## Architecture & Technology

### Tech Stack
- **Framework**: SolidJS with Vinxi for SSR/SSG
- **Database**: Neo4j graph database
- **Styling**: Custom CSS-in-JS system with theme support
- **Icons**: Carbon icons (carbon:icon-name format)
- **State Management**: SolidJS stores via `_.createStore`

### Page Schema System
All pages and components are defined using hjson files following the graph-based schema system:
- **Vertices**: Define UI elements with properties like displayOrder, componentName, props, css
- **Edges**: Define parent-child relationships between elements
- **Dynamic Properties**: Use function body strings in props/css for dynamic behavior

## Core Features

### 1. User Authentication & Profile
- User registration/login system
- Profile management with balance tracking
- Role-based access (User, Assistant, Admin)

### 2. Balance Management System
- Prepaid balance model
- Recharge with bonus incentives
- Transaction history tracking
- Real-time balance updates across pages

### 3. Problem Submission Flow
- Categorized problem submission
- Real-time cost estimation
- Urgency levels (normal/urgent pricing)
- File attachment support (planned)

### 4. Assistant Matching System
- Automatic assignment based on expertise
- Assistant profiles with ratings
- Real-time status updates

### 5. Solution Delivery & Approval
- Solution presentation with attachments
- Approve/Reject mechanism
- Automatic payment processing on approval
- Dispute resolution system

### 6. Payment Processing
- Multiple payment methods (Card, PayPal, Apple Pay, Google Pay)
- Secure transaction handling
- Instant balance updates

## Pages Documentation

### User Pages

#### 1. RealAssistantHomePage (`/`)
**Purpose**: Landing page for new and returning users
**Features**:
- Hero section with call-to-action
- Feature highlights (4 key benefits)
- How it works (4-step process)
- Responsive design with smooth scrolling

#### 2. RealAssistantUserDashboard (`/dashboard`)
**Purpose**: Central hub for users to manage their problems
**Features**:
- Balance display
- Statistics cards (active problems, solved problems, balance)
- Active problems list with status
- Recent transactions
- Quick actions (Submit Problem, Recharge)

#### 3. RealAssistantProblemSubmission (`/problem/new`)
**Purpose**: Form for users to submit new problems
**Features**:
- Dynamic form with validation
- Category selection with base prices
- Urgency selection (affects pricing)
- Real-time cost estimation
- Balance check before submission

#### 4. RealAssistantProblemDetails (`/problem/:id`)
**Purpose**: Detailed view of a specific problem
**Features**:
- Problem description and metadata
- Assistant information with rating
- Solution presentation
- Approve/Reject functionality
- Message history (chat-like interface)
- Cost breakdown

#### 5. RealAssistantRecharge (`/recharge`)
**Purpose**: Add funds to user balance
**Features**:
- Preset amounts with bonuses
- Custom amount input
- Multiple payment methods
- Order summary
- Secure payment indicators

### Assistant Pages

#### 6. RealAssistantAssistantDashboard (`/assistant/dashboard`)
**Purpose**: Central hub for assistants to manage their work
**Features**:
- Earnings overview and withdrawal button
- Active problems with priority indicators
- Performance metrics (rating, completion rate, response time)
- Available problems matching expertise
- Quick stats and recent activity

#### 7. RealAssistantAssistantSolution (`/assistant/solution/:id`)
**Purpose**: Interface for assistants to submit solutions
**Features**:
- Problem details and user information
- Rich text solution editor
- File attachment support
- Time tracking and cost breakdown
- Solution submission with confidence level
- Previous solutions reference

#### 8. RealAssistantAssistantEarnings (`/assistant/earnings`)
**Purpose**: Financial management for assistants
**Features**:
- Current balance and pending earnings
- Detailed transaction history
- Withdrawal requests and processing
- Earnings analytics and trends
- Tax document generation
- Payment method management

#### 9. RealAssistantAssistantProfile (`/assistant/profile`)
**Purpose**: Profile and expertise management
**Features**:
- Profile completion tracker (85% indicator)
- Basic information editing
- Avatar upload functionality
- Areas of expertise with skill tags
- Certifications with verification status
- Performance statistics display
- Edit mode toggle

#### 10. RealAssistantAssistantAvailability (`/assistant/availability`)
**Purpose**: Work schedule and availability settings
**Features**:
- Current status toggle (Available/Busy/Offline)
- Active problems counter
- Response time commitment settings
- Auto-accept problems toggle
- Weekly schedule configuration
- Time off management
- Notification preferences

### Admin Pages

#### 11. RealAssistantAdminDashboard (`/admin/dashboard`)
**Purpose**: Platform overview and monitoring
**Features**:
- Key metrics cards (users, revenue, problems, ratings)
- Real-time alerts for critical events
- Recent problems table with quick actions
- Top performing assistants leaderboard
- Platform health indicators
- Quick navigation to admin sections

#### 12. RealAssistantAdminUsers (`/admin/users`)
**Purpose**: User and assistant management
**Features**:
- Comprehensive user table with search
- Role and status filtering
- Bulk actions support
- User details (balance, problems, earnings)
- Account actions (view, edit, suspend)
- Profile completion tracking
- Export functionality

#### 13. RealAssistantAdminProblems (`/admin/problems`)
**Purpose**: Problem monitoring and management
**Features**:
- Problem status overview cards
- Advanced filtering (status, category, urgency)
- Problem assignment tools
- Cost tracking (estimated vs actual)
- Dispute resolution interface
- Bulk assignment functionality
- Export reports

#### 14. RealAssistantAdminTransactions (`/admin/transactions`)
**Purpose**: Financial oversight and management
**Features**:
- Financial metrics dashboard
- Transaction history with filtering
- Pending withdrawals management
- Revenue breakdown analysis
- Transaction type filtering
- Reconciliation tools
- CSV export functionality

#### 15. RealAssistantAdminSettings (`/admin/settings`)
**Purpose**: Platform configuration
**Features**:
- Multi-tab settings interface
- General settings (site info, maintenance mode)
- Pricing configuration (fees, limits)
- Payment gateway settings
- Assistant settings (commission, requirements)
- Notification settings
- Security configuration
- Save/revert functionality

#### 16. RealAssistantAdminReports (`/admin/reports`)
**Purpose**: Analytics and reporting
**Features**:
- Key performance metrics
- Revenue trend charts
- Category performance analysis
- Assistant performance rankings
- Platform metrics tracking
- Date range filtering
- Export report generation
- Visual data representations

## Components Documentation

### 1. RealAssistantHeader
**Variants**:
- `showBalance` (boolean): Show/hide balance display

**Usage**:
```hjson
{
  componentName: "RealAssistantHeader",
  showBalance: true
}
```

### 2. RealAssistantCard
**Variants**:
- `variant`: "default" | "elevated" | "bordered"

**Props**:
- `onClick`: Optional click handler

### 3. RealAssistantButton
**Variants**:
- `variant`: "primary" | "secondary" | "success" | "danger"
- `size`: "small" | "medium" | "large"
- `fullWidth`: boolean

**Props**:
- `text`: Button label
- `icon`: Carbon icon name
- `onClick`: Click handler
- `disabled`: Disable state

## Theme System

### Color Palette
- **Primary**: Professional blue (trust, reliability)
- **Secondary**: Purple (premium feel)
- **Success**: Green (completed actions)
- **Warning**: Orange (pending states)
- **Error**: Red (issues, rejections)
- **Accent**: Teal (highlights)

### Theme Variables Access
```javascript
_.theme.var.color.primary
_.theme.var.color.primary_light_100
_.theme.var.color.primary_dark_200
_.theme.var.color.primary_text
```

## Data Models (Planned)

### User
```javascript
{
  id: string,
  email: string,
  name: string,
  role: "user" | "assistant" | "admin",
  balance: number,
  rating: number, // for assistants
  expertise: string[], // for assistants
  createdAt: date,
  settings: object
}
```

### Problem
```javascript
{
  id: string,
  userId: string,
  title: string,
  description: string,
  category: string,
  urgency: "normal" | "urgent",
  status: string,
  estimatedCost: number,
  actualCost: number,
  assignedTo: string, // assistant ID
  createdAt: date,
  updatedAt: date
}
```

### Solution
```javascript
{
  id: string,
  problemId: string,
  assistantId: string,
  content: string,
  attachments: string[],
  approved: boolean,
  providedAt: date,
  approvedAt: date
}
```

### Transaction
```javascript
{
  id: string,
  userId: string,
  type: "payment" | "recharge" | "refund",
  amount: number,
  description: string,
  relatedId: string, // problem or recharge ID
  createdAt: date
}
```

## Future Development

### Completed Features (Phase 1)
✅ User portal with all core functionality
✅ Assistant portal with profile and availability management
✅ Admin panel with comprehensive management tools
✅ Complete payment and balance system
✅ Problem submission and solution workflow

### Phase 2 Features
1. **Enhanced Messaging System**
   - Real-time chat between users and assistants
   - File sharing capabilities
   - Push notification system
   - Read receipts and typing indicators

2. **Advanced Analytics**
   - Detailed performance metrics
   - Revenue forecasting
   - User behavior analytics
   - Assistant efficiency tracking

3. **Mobile Applications**
   - iOS and Android apps
   - Push notifications
   - Offline mode support
   - Native payment integration

### Phase 3 Features
1. **AI Integration**
   - Smart problem categorization
   - Assistant recommendation engine
   - Automated quality checks
   - Predictive pricing

2. **Enterprise Features**
   - Team accounts
   - Bulk problem submission
   - Custom SLAs
   - API for third-party integration

3. **Global Expansion**
   - Multi-language support
   - Multi-currency handling
   - Regional assistant pools
   - Localized payment methods

## Development Guidelines

### Adding New Pages
1. Create hjson file in `/pages` directory
2. Follow naming convention: `RealAssistant[PageName].hjson`
3. Include URL in Page vertex properties
4. Use consistent state management patterns

### Adding New Components
1. Create hjson file in `/components` directory
2. Define variants for flexibility
3. Document props and usage
4. Maintain consistent styling

### State Management Best Practices
1. Use `_.createStore` for component state
2. Store user data in `_.userSetting` for persistence
3. Handle loading and error states
4. Validate forms before submission

### CSS Guidelines
1. Always use `._id` selector
2. Use theme variables for colors
3. Include responsive breakpoints
4. Use rem units for sizing

## Testing Checklist

### User Flow Testing
- [ ] User can register and login
- [ ] Balance displays correctly across pages
- [ ] Problem submission with validation
- [ ] Cost estimation updates correctly
- [ ] Solution approval/rejection works
- [ ] Payment deduction on approval
- [ ] Recharge adds correct amount
- [ ] Navigation between pages

### Responsive Testing
- [ ] Mobile layout (< 768px)
- [ ] Tablet layout (768px - 1024px)
- [ ] Desktop layout (> 1024px)
- [ ] Touch interactions
- [ ] Form usability on mobile

### Edge Cases
- [ ] Insufficient balance handling
- [ ] Form validation errors
- [ ] Empty states
- [ ] Loading states
- [ ] Error handling

## Deployment Notes

### Environment Variables Needed
- `NEO4J_URI`: Database connection
- `NEO4J_USER`: Database username
- `NEO4J_PASSWORD`: Database password
- `PAYMENT_GATEWAY_KEY`: Payment processing
- `SESSION_SECRET`: Session management

### Database Setup
1. Create Neo4j indexes for User, Problem, Solution, Transaction
2. Set up constraints for unique IDs
3. Create initial roles (User, Assistant, Admin)
4. Seed test data for development

### Production Considerations
- Enable HTTPS for payment security
- Set up monitoring for transactions
- Configure backup strategy
- Implement rate limiting
- Set up error tracking

## Contact & Support

For questions about this implementation:
- Review the page schema documentation at `/src/routes/api/chat/SYSTEM_PROMPT.md`
- Check the main project README
- Reference the SolidJS and Neo4j documentation

This documentation should be updated as new features are added or requirements change.