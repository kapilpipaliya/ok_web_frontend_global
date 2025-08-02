# RealAssistant App Documentation

## Overview
RealAssistant is a platform that connects users with real human assistants to solve everyday problems. Users pay a small fee per problem solved, with transparent pricing and a balance-based payment system.

## Project Structure

```
/src/page_schema/realassistant/
├── docs/
│   └── README.md (this file)
├── themes/
│   └── RealAssistantTheme.hjson
├── components/
│   ├── RealAssistantHeader.hjson
│   ├── RealAssistantCard.hjson
│   └── RealAssistantButton.hjson
└── pages/
    ├── RealAssistantHomePage.hjson
    ├── RealAssistantUserDashboard.hjson
    ├── RealAssistantProblemSubmission.hjson
    ├── RealAssistantProblemDetails.hjson
    └── RealAssistantRecharge.hjson
```

## Architecture & Technology

### Tech Stack
- **Framework**: SolidJS with Vinxi for SSR/SSG
- **Database**: Neo4j graph database
- **Styling**: Custom CSS-in-JS system with theme support
- **Icons**: Carbon icons (carbon:icon-name format)
- **State Management**: SolidJS stores via `args.createStore`

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

### 1. RealAssistantHomePage (`/`)
**Purpose**: Landing page for new and returning users
**Features**:
- Hero section with call-to-action
- Feature highlights (4 key benefits)
- How it works (4-step process)
- Responsive design with smooth scrolling

### 2. RealAssistantUserDashboard (`/dashboard`)
**Purpose**: Central hub for users to manage their problems
**Features**:
- Balance display
- Statistics cards (active problems, solved problems, balance)
- Active problems list with status
- Recent transactions
- Quick actions (Submit Problem, Recharge)

**State Management**:
```javascript
{
  isLoggedIn: boolean,
  balance: number,
  userName: string,
  activeProblems: Array,
  recentTransactions: Array,
  stats: {
    totalProblems: number,
    solvedProblems: number,
    pendingProblems: number,
    totalSpent: number
  }
}
```

### 3. RealAssistantProblemSubmission (`/problem/new`)
**Purpose**: Form for users to submit new problems
**Features**:
- Dynamic form with validation
- Category selection with base prices
- Urgency selection (affects pricing)
- Real-time cost estimation
- Balance check before submission

**Categories**:
- Technology & Computer ($8 base)
- Education & Learning ($10 base)
- Business & Finance ($12 base)
- Personal & Lifestyle ($6 base)
- Other ($8 base)

### 4. RealAssistantProblemDetails (`/problem/:id`)
**Purpose**: Detailed view of a specific problem
**Features**:
- Problem description and metadata
- Assistant information with rating
- Solution presentation
- Approve/Reject functionality
- Message history (chat-like interface)
- Cost breakdown

**Status Flow**:
- `pending` → `in_progress` → `solution_provided` → `completed`/`disputed`

### 5. RealAssistantRecharge (`/recharge`)
**Purpose**: Add funds to user balance
**Features**:
- Preset amounts with bonuses
- Custom amount input
- Multiple payment methods
- Order summary
- Secure payment indicators

**Bonus Structure**:
- $10: No bonus
- $25: +$2 bonus
- $50: +$5 bonus
- $100: +$15 bonus
- $200: +$40 bonus

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
args.theme.var.color.primary
args.theme.var.color.primary_light_100
args.theme.var.color.primary_dark_200
args.theme.var.color.primary_text
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

### Phase 2 Features
1. **Assistant Dashboard** (`/assistant/dashboard`)
   - View assigned problems
   - Submit solutions
   - Track earnings
   - Performance metrics

2. **Transaction History Page** (`/transactions`)
   - Full transaction history
   - Filtering and search
   - Export functionality

3. **Admin Panel** (`/admin`)
   - User management
   - Problem monitoring
   - Financial reports
   - System settings

### Phase 3 Features
1. **Rating System**
   - User rates assistants after solution
   - Assistant performance tracking
   - Quality assurance

2. **Messaging System**
   - Real-time chat between users and assistants
   - File sharing
   - Notification system

3. **Advanced Features**
   - Problem templates
   - Bulk problem submission
   - Subscription plans
   - API for third-party integration

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
1. Use `args.createStore` for component state
2. Store user data in `args.userSetting` for persistence
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