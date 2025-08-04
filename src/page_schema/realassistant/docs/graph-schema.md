# RealAssistant Graph Database Schema

## Overview
This document defines the Neo4j graph database schema for RealAssistant, built on top of the existing user authentication and role management system already present in the project. The schema extends the current structure while maintaining compatibility with existing authentication flows.

## Core Node Types (Labels)

### 1. User (Extended from Existing)
**Purpose**: Leverages the existing User node structure with RealAssistant-specific extensions
```cypher
(:User {
  // === EXISTING SYSTEM PROPERTIES ===
  uuid: string,             // UUIDv7 - Primary identifier
  email: string,            // Unique, indexed
  username: string,         // Username
  password: string,         // Hashed password
  salt: string,             // Salt for password hashing
  emailConfirmed: boolean,  // Email verification status
  createdAt: LocalDateTime, // Account creation
  status: string,           // User status (active, invited, etc.)
  pendingEmail: string?,    // For email change flow
  
  // RealAssistant properties moved to separate vertices for better audit trail
})
```

### 2. Role (Uses Existing Structure)
**Purpose**: Uses the existing Role system with predefined RealAssistant roles
```cypher
(:Role {
  // === EXISTING SYSTEM PROPERTIES ===
  key: string,          // Unique identifier
  name: string,         // Display name
  createdAt: DateTime   // Creation timestamp
})

// Predefined RealAssistant Roles:
// - 'Customer': Regular user who submits problems
// - 'Assistant': Verified assistant who solves problems
// - 'RealAssistantAdmin': RealAssistant platform administrator
// Note: These work alongside existing system roles (Admin, User, Guest, SystemAdmin)
```

### 3. Balance
**Purpose**: Tracks user balance (separate for audit trail)
```cypher
(:Balance {
  id: string,
  amount: float,
  currency: string,         // "USD", etc.
  lastUpdated: datetime,
  version: integer          // For optimistic locking
})
```

### 4. Profile
**Purpose**: User profile information
```cypher
(:Profile {
  id: string,
  phoneNumber: string?,
  location: string?,
  timezone: string?,
  bio: string?,
  avatar: string?,
  profileComplete: integer,   // Percentage 0-100
  lastUpdated: datetime
})
```

### 5. AssistantStats
**Purpose**: Assistant performance statistics
```cypher
(:AssistantStats {
  id: string,
  rating: float,              // Average rating 1-5
  responseTime: string,       // Avg response time
  completionRate: float,      // Success rate percentage
  totalEarnings: float,       // Total earnings
  totalProblems: integer,     // Total problems solved
  lastUpdated: datetime
})
```

### 6. CustomerStats
**Purpose**: Customer usage statistics  
```cypher
(:CustomerStats {
  id: string,
  totalSpent: float,          // Total amount spent
  totalProblems: integer,     // Total problems submitted
  avgRating: float,           // Average rating given
  lastActive: datetime,
  lastUpdated: datetime
})
```

### 7. Preferences
**Purpose**: User preferences and settings
```cypher
(:Preferences {
  id: string,
  notifications: string?,     // JSON: email, push, sms settings
  categories: string?,        // JSON: preferred categories
  language: string?,
  theme: string?,
  autoAccept: boolean?,       // For assistants
  maxProblems: integer?,      // For assistants
  lastUpdated: datetime
})
```

### 8. Problem
**Purpose**: Problems submitted by users
```cypher
(:Problem {
  id: string,               // UUID
  title: string,
  description: string,
  category: string,
  urgency: string,          // "normal" | "urgent"
  status: string,           // "pending" | "assigned" | "in_progress" | "solution_provided" | "completed" | "disputed" | "cancelled"
  estimatedCost: float,
  actualCost: float?,
  createdAt: datetime,
  updatedAt: datetime,
  assignedAt: datetime?,
  completedAt: datetime?,
  metadata: string?         // JSON for additional fields
})
```

### 9. Solution
**Purpose**: Solutions provided by assistants
```cypher
(:Solution {
  id: string,
  content: string,
  attachments: string?,     // JSON array of attachment URLs
  confidenceLevel: string?, // "high" | "medium" | "low"
  timeSpent: integer?,      // Minutes spent on solution
  isApproved: boolean?,
  approvedAt: datetime?,
  rejectedAt: datetime?,
  rejectionReason: string?,
  createdAt: datetime,
  updatedAt: datetime
})
```

### 10. Transaction
**Purpose**: Financial transactions in RealAssistant
```cypher
(:Transaction {
  id: string,
  type: string,             // "recharge" | "payment" | "refund" | "bonus" | "withdrawal"
  amount: float,
  currency: string,         // "USD"
  status: string,           // "pending" | "completed" | "failed" | "cancelled"
  description: string,
  paymentMethod: string?,
  paymentReference: string?,
  createdAt: datetime,
  processedAt: datetime?,
  metadata: string?         // Payment gateway details
})
```

### 11. Category
**Purpose**: Problem categories with pricing
```cypher
(:Category {
  id: string,
  key: string,              // "tech" | "education" | "business" | "personal" | "legal" | "other"
  name: string,
  description: string,
  basePrice: float,
  urgentMultiplier: float,  // Price multiplier for urgent problems
  isActive: boolean,
  order: integer,
  icon: string?,            // Carbon icon name
  expertiseRequired: string?, // JSON array of required expertise
  createdAt: datetime,
  updatedAt: datetime
})
```

### 12. Expertise
**Purpose**: Areas of expertise for assistants
```cypher
(:Expertise {
  id: string,
  key: string,
  name: string,
  category: string,         // Related category
  description: string,
  skillLevel: string?,      // "beginner" | "intermediate" | "expert"
  certificationRequired: boolean
})
```

### 13. Message
**Purpose**: Communication between users and assistants
```cypher
(:Message {
  id: string,
  content: string,
  type: string,             // "text" | "system" | "attachment"
  isRead: boolean,
  readAt: datetime?,
  createdAt: datetime,
  metadata: string?         // Attachment info, formatting, etc.
})
```

### 14. Rating
**Purpose**: User ratings for completed problems
```cypher
(:Rating {
  id: string,
  score: integer,           // 1-5
  comment: string?,
  aspects: string?,         // JSON: {quality: 5, speed: 4, communication: 5}
  isPublic: boolean,
  createdAt: datetime
})
```

### 15. Schedule
**Purpose**: Assistant availability schedule
```cypher
(:Schedule {
  id: string,
  dayOfWeek: integer,       // 0-6 (Sunday-Saturday)
  startTime: string,        // "09:00"
  endTime: string,          // "17:00"
  timezone: string,
  isActive: boolean,
  breaks: string?           // JSON array of break times
})
```

### 16. Withdrawal
**Purpose**: Assistant withdrawal requests
```cypher
(:Withdrawal {
  id: string,
  amount: float,
  method: string,           // "bank_transfer" | "paypal" | "stripe"
  accountDetails: string,   // Encrypted JSON
  status: string,           // "pending" | "processing" | "completed" | "rejected"
  requestedAt: datetime,
  processedAt: datetime?,
  rejectionReason: string?,
  transactionRef: string?
})
```

## Relationship Types

### User and Role Relationships (Using Existing Pattern)
```cypher
// === EXISTING RELATIONSHIP ===
(u:User)-[:UserRole]->(r:Role)

// Example: Assign customer role
MATCH (u:User {uuid: $uuid})
MATCH (r:Role {key: 'Customer'})
MERGE (u)-[:UserRole]->(r)
```

### RealAssistant-Specific Relationships
```cypher
// User has balance (one-to-one)
(u:User)-[:HAS_BALANCE]->(b:Balance)

// User has profile (one-to-one)
(u:User)-[:HAS_PROFILE]->(p:Profile)

// Assistant has stats (one-to-one)
(a:User)-[:HAS_ASSISTANT_STATS]->(s:AssistantStats)

// Customer has stats (one-to-one)
(c:User)-[:HAS_CUSTOMER_STATS]->(s:CustomerStats)

// User has preferences (one-to-one)
(u:User)-[:HAS_PREFERENCES]->(p:Preferences)

// User submits problems
(u:User)-[:SUBMITTED]->(p:Problem)

// Assistant assigned to problem
(a:User)-[:ASSIGNED_TO]->(p:Problem)

// Problem has solution
(p:Problem)-[:HAS_SOLUTION]->(s:Solution)

// Solution provided by assistant
(s:Solution)-[:PROVIDED_BY]->(a:User)

// Problem in category
(p:Problem)-[:IN_CATEGORY]->(c:Category)

// User makes transaction
(u:User)-[:MADE_TRANSACTION]->(t:Transaction)

// Transaction for problem
(t:Transaction)-[:FOR_PROBLEM]->(p:Problem)

// Problem has messages
(p:Problem)-[:HAS_MESSAGE]->(m:Message)

// Message sent by user
(m:Message)-[:SENT_BY]->(u:User)

// Problem has rating
(p:Problem)-[:HAS_RATING]->(r:Rating)

// Rating given by user
(r:Rating)-[:RATED_BY]->(u:User)

// Rating for assistant
(r:Rating)-[:RATING_FOR]->(a:User)

// Assistant has expertise
(a:User)-[:HAS_EXPERTISE {
  level: string,          // "beginner" | "intermediate" | "expert"
  certified: boolean,
  certifiedAt: datetime?
}]->(e:Expertise)

// Assistant has schedule
(a:User)-[:HAS_SCHEDULE]->(s:Schedule)

// Assistant withdrawal request
(a:User)-[:REQUESTED_WITHDRAWAL]->(w:Withdrawal)

// Withdrawal linked to transaction
(w:Withdrawal)-[:WITHDRAWAL_TRANSACTION]->(t:Transaction)
```

## Common Query Patterns

### Check User Role (Using Existing Pattern)
```cypher
// Check if user is a customer
MATCH (u:User {uuid: $uuid})-[:UserRole]->(r:Role {key: 'Customer'})
RETURN count(r) > 0 as isCustomer

// Check if user is an assistant
MATCH (u:User {uuid: $uuid})-[:UserRole]->(r:Role {key: 'Assistant'})
RETURN count(r) > 0 as isAssistant

// Get all user roles (including system and RealAssistant roles)
MATCH (u:User {uuid: $uuid})-[:UserRole]->(r:Role)
RETURN collect(r.key) as roles
```

### Get User Dashboard Data
```cypher
MATCH (u:User {uuid: $userId})
OPTIONAL MATCH (u)-[:HAS_BALANCE]->(b:Balance)
OPTIONAL MATCH (u)-[:HAS_PROFILE]->(prof:Profile)
OPTIONAL MATCH (u)-[:HAS_CUSTOMER_STATS]->(cs:CustomerStats)
OPTIONAL MATCH (u)-[:HAS_ASSISTANT_STATS]->(as:AssistantStats)
OPTIONAL MATCH (u)-[:HAS_PREFERENCES]->(pref:Preferences)
OPTIONAL MATCH (u)-[:UserRole]->(role:Role)
WHERE role.key IN ['Customer', 'Assistant', 'RealAssistantAdmin']
OPTIONAL MATCH (u)-[:SUBMITTED]->(p:Problem)
WHERE p.status IN ['pending', 'assigned', 'in_progress', 'solution_provided']
OPTIONAL MATCH (u)-[:MADE_TRANSACTION]->(t:Transaction)
WHERE t.createdAt > datetime() - duration('P30D')
RETURN u {
  .*, 
  balance: b.amount,
  currency: b.currency,
  profile: prof,
  customerStats: cs,
  assistantStats: as,
  preferences: pref,
  roles: collect(DISTINCT role.key),
  activeProblems: collect(DISTINCT p),
  recentTransactions: collect(DISTINCT t)
}
```

### Submit New Problem
```cypher
// First verify user has customer role and sufficient balance
MATCH (u:User {uuid: $userId})-[:UserRole]->(:Role {key: 'Customer'})
MATCH (u)-[:HAS_BALANCE]->(b:Balance)
WHERE b.amount >= $estimatedCost
MATCH (c:Category {key: $categoryKey})
CREATE (p:Problem {
  id: randomUUID(),
  title: $title,
  description: $description,
  urgency: $urgency,
  status: 'pending',
  estimatedCost: $estimatedCost,
  createdAt: datetime(),
  updatedAt: datetime()
})
CREATE (u)-[:SUBMITTED]->(p)
CREATE (p)-[:IN_CATEGORY]->(c)
RETURN p
```

### Assign Assistant to Problem
```cypher
// Verify assistant role and expertise match
MATCH (a:User {uuid: $assistantId})-[:UserRole]->(:Role {key: 'Assistant'})
MATCH (p:Problem {id: $problemId})-[:IN_CATEGORY]->(c:Category)
OPTIONAL MATCH (a)-[:HAS_EXPERTISE]->(e:Expertise {category: c.key})
WHERE p.status = 'pending'
CREATE (a)-[:ASSIGNED_TO]->(p)
SET p.status = 'assigned', 
    p.assignedAt = datetime(),
    p.updatedAt = datetime()
RETURN p, a
```

### Process Payment After Solution Approval
```cypher
MATCH (u:User {uuid: $userId})-[:SUBMITTED]->(p:Problem {id: $problemId})
MATCH (p)-[:HAS_SOLUTION]->(s:Solution)
MATCH (s)-[:PROVIDED_BY]->(a:User)
MATCH (u)-[:HAS_BALANCE]->(ub:Balance)
MATCH (a)-[:HAS_BALANCE]->(ab:Balance)
OPTIONAL MATCH (u)-[:HAS_CUSTOMER_STATS]->(ucs:CustomerStats)
OPTIONAL MATCH (a)-[:HAS_ASSISTANT_STATS]->(aas:AssistantStats)
WHERE s.isApproved = true AND ub.amount >= p.actualCost
CREATE (t:Transaction {
  id: randomUUID(),
  type: 'payment',
  amount: p.actualCost,
  currency: 'USD',
  status: 'completed',
  description: 'Payment for problem: ' + p.title,
  createdAt: datetime(),
  processedAt: datetime()
})
CREATE (u)-[:MADE_TRANSACTION]->(t)
CREATE (t)-[:FOR_PROBLEM]->(p)
SET ub.amount = ub.amount - p.actualCost,
    ub.lastUpdated = datetime(),
    ab.amount = ab.amount + (p.actualCost * 0.85), // 85% to assistant
    ab.lastUpdated = datetime(),
    ucs.totalSpent = coalesce(ucs.totalSpent, 0) + p.actualCost,
    ucs.totalProblems = coalesce(ucs.totalProblems, 0) + 1,
    ucs.lastActive = datetime(),
    ucs.lastUpdated = datetime(),
    aas.totalEarnings = coalesce(aas.totalEarnings, 0) + (p.actualCost * 0.85),
    aas.totalProblems = coalesce(aas.totalProblems, 0) + 1,
    aas.lastUpdated = datetime(),
    p.status = 'completed',
    p.completedAt = datetime()
RETURN t, ub.amount as newBalance
```

### Get Assistant Performance Metrics
```cypher
MATCH (a:User {uuid: $assistantId})-[:UserRole]->(:Role {key: 'Assistant'})
OPTIONAL MATCH (a)-[:HAS_ASSISTANT_STATS]->(stats:AssistantStats)
OPTIONAL MATCH (a)-[:HAS_PROFILE]->(prof:Profile)
OPTIONAL MATCH (a)-[:ASSIGNED_TO]->(p:Problem)
OPTIONAL MATCH (p)-[:HAS_RATING]->(r:Rating)
WITH a, stats, prof, count(DISTINCT p) as totalProblems, 
     count(DISTINCT CASE WHEN p.status = 'completed' THEN p END) as completedProblems,
     avg(r.score) as avgRating,
     collect(r) as ratings
RETURN a {
  .*,
  profile: prof,
  stats: stats,
  totalProblems: totalProblems,
  completedProblems: completedProblems,
  completionRate: CASE WHEN totalProblems > 0 
                       THEN toFloat(completedProblems) / totalProblems * 100 
                       ELSE 0 END,
  rating: avgRating,
  totalRatings: size(ratings)
}
```

## Indexes and Constraints

### Unique Constraints (Additional to Existing)
```cypher
// RealAssistant-specific constraints
CREATE CONSTRAINT balance_id_unique ON (b:Balance) ASSERT b.id IS UNIQUE;
CREATE CONSTRAINT profile_id_unique ON (p:Profile) ASSERT p.id IS UNIQUE;
CREATE CONSTRAINT assistant_stats_id_unique ON (s:AssistantStats) ASSERT s.id IS UNIQUE;
CREATE CONSTRAINT customer_stats_id_unique ON (s:CustomerStats) ASSERT s.id IS UNIQUE;
CREATE CONSTRAINT preferences_id_unique ON (p:Preferences) ASSERT p.id IS UNIQUE;
CREATE CONSTRAINT problem_id_unique ON (p:Problem) ASSERT p.id IS UNIQUE;
CREATE CONSTRAINT solution_id_unique ON (s:Solution) ASSERT s.id IS UNIQUE;
CREATE CONSTRAINT transaction_id_unique ON (t:Transaction) ASSERT t.id IS UNIQUE;
CREATE CONSTRAINT category_key_unique ON (c:Category) ASSERT c.key IS UNIQUE;
CREATE CONSTRAINT expertise_key_unique ON (e:Expertise) ASSERT e.key IS UNIQUE;
```

### Performance Indexes
```cypher
// Balance indexes
CREATE INDEX balance_amount FOR (b:Balance) ON (b.amount);

// Profile indexes
CREATE INDEX profile_timezone FOR (p:Profile) ON (p.timezone);
CREATE INDEX profile_complete FOR (p:Profile) ON (p.profileComplete);

// AssistantStats indexes
CREATE INDEX assistant_stats_rating FOR (s:AssistantStats) ON (s.rating);
CREATE INDEX assistant_stats_earnings FOR (s:AssistantStats) ON (s.totalEarnings);

// CustomerStats indexes  
CREATE INDEX customer_stats_spent FOR (s:CustomerStats) ON (s.totalSpent);
CREATE INDEX customer_stats_active FOR (s:CustomerStats) ON (s.lastActive);

// Problem indexes
CREATE INDEX problem_status FOR (p:Problem) ON (p.status);
CREATE INDEX problem_created FOR (p:Problem) ON (p.createdAt);
CREATE INDEX problem_category FOR (p:Problem) ON (p.category);

// Transaction indexes
CREATE INDEX transaction_type FOR (t:Transaction) ON (t.type);
CREATE INDEX transaction_status FOR (t:Transaction) ON (t.status);
CREATE INDEX transaction_user_date FOR (t:Transaction) ON (t.createdAt);

// Message indexes
CREATE INDEX message_created FOR (m:Message) ON (m.createdAt);
CREATE INDEX message_read FOR (m:Message) ON (m.isRead);
```

## Migration and Setup

### 1. Create RealAssistant Roles
```cypher
// Create RealAssistant-specific roles
MERGE (r1:Role {key: 'Customer'})
SET r1.name = 'Customer', r1.createdAt = datetime()

MERGE (r2:Role {key: 'Assistant'})
SET r2.name = 'Assistant', r2.createdAt = datetime()

MERGE (r3:Role {key: 'RealAssistantAdmin'})
SET r3.name = 'RealAssistant Administrator', r3.createdAt = datetime()
```

### 2. Upgrade Existing Users
```cypher
// Create Balance, Profile, Stats, and Preferences for existing users
MATCH (u:User)
WHERE NOT EXISTS((u)-[:HAS_BALANCE]->(:Balance))

// Create Balance
CREATE (b:Balance {
  id: randomUUID(),
  amount: 0.0,
  currency: 'USD',
  lastUpdated: datetime(),
  version: 1
})
CREATE (u)-[:HAS_BALANCE]->(b)

// Create Profile
WITH u
WHERE NOT EXISTS((u)-[:HAS_PROFILE]->(:Profile))
CREATE (prof:Profile {
  id: randomUUID(),
  profileComplete: 50,
  timezone: 'UTC',
  lastUpdated: datetime()
})
CREATE (u)-[:HAS_PROFILE]->(prof)

// Create Preferences
WITH u
WHERE NOT EXISTS((u)-[:HAS_PREFERENCES]->(:Preferences))
CREATE (pref:Preferences {
  id: randomUUID(),
  language: 'en',
  theme: 'light',
  lastUpdated: datetime()
})
CREATE (u)-[:HAS_PREFERENCES]->(pref)
    
// Assign default customer role to existing users
MATCH (u:User)
MATCH (r:Role {key: 'Customer'})
WHERE NOT EXISTS((u)-[:UserRole]->(:Role {key: 'Customer'}))
CREATE (u)-[:UserRole]->(r)

// Create CustomerStats for customers
WITH u
WHERE NOT EXISTS((u)-[:HAS_CUSTOMER_STATS]->(:CustomerStats))
  AND EXISTS((u)-[:UserRole]->(:Role {key: 'Customer'}))
CREATE (cs:CustomerStats {
  id: randomUUID(),
  totalSpent: 0.0,
  totalProblems: 0,
  lastActive: datetime(),
  lastUpdated: datetime()
})
CREATE (u)-[:HAS_CUSTOMER_STATS]->(cs)

// Create AssistantStats for assistants
WITH u
WHERE NOT EXISTS((u)-[:HAS_ASSISTANT_STATS]->(:AssistantStats))
  AND EXISTS((u)-[:UserRole]->(:Role {key: 'Assistant'}))
CREATE (as:AssistantStats {
  id: randomUUID(),
  rating: 0.0,
  responseTime: 'Not set',
  completionRate: 0.0,
  totalEarnings: 0.0,
  totalProblems: 0,
  lastUpdated: datetime()
})
CREATE (u)-[:HAS_ASSISTANT_STATS]->(as)
```

### 3. Create Categories
```cypher
UNWIND [
  {key: 'tech', name: 'Technology & Computer', basePrice: 8, urgentMultiplier: 1.5},
  {key: 'education', name: 'Education & Learning', basePrice: 10, urgentMultiplier: 1.5},
  {key: 'business', name: 'Business & Finance', basePrice: 12, urgentMultiplier: 2.0},
  {key: 'personal', name: 'Personal & Lifestyle', basePrice: 6, urgentMultiplier: 1.5},
  {key: 'legal', name: 'Legal & Documentation', basePrice: 15, urgentMultiplier: 2.0},
  {key: 'other', name: 'Other', basePrice: 8, urgentMultiplier: 1.5}
] as cat
CREATE (c:Category {
  id: randomUUID(),
  key: cat.key,
  name: cat.name,
  basePrice: cat.basePrice,
  urgentMultiplier: cat.urgentMultiplier,
  isActive: true,
  createdAt: datetime()
})
```

## Security Considerations

### 1. Role-Based Access Control
```cypher
// All RealAssistant queries should verify role membership
// Example: Only customers can submit problems
MATCH (u:User {uuid: $userId})-[:UserRole]->(:Role {key: 'Customer'})
// ... rest of query

// Only assistants can provide solutions
MATCH (a:User {uuid: $assistantId})-[:UserRole]->(:Role {key: 'Assistant'})
// ... rest of query
```

### 2. Resource Access Verification
```cypher
// User can only access their own problems or assigned problems
MATCH (u:User {uuid: $userId})
MATCH (p:Problem {id: $problemId})
WHERE EXISTS((u)-[:SUBMITTED]->(p)) OR EXISTS((u)-[:ASSIGNED_TO]->(p))
// ... rest of query
```

### 3. Balance Verification
```cypher
// Always check balance before transactions
MATCH (u:User {uuid: $userId})-[:HAS_BALANCE]->(b:Balance)
WHERE b.amount >= $requiredAmount
// ... rest of query
```

## Integration with Existing System

### Authentication Flow
1. User authenticates using existing system (email/password)
2. System checks UserRole relationships for RealAssistant roles
3. UI adapts based on roles (Customer, Assistant, Admin)
4. RealAssistant-specific properties are loaded from User node

### Permission Checks
```cypher
// Combine system roles with RealAssistant roles
MATCH (u:User {uuid: $userId})-[:UserRole]->(r:Role)
WITH u, collect(r.key) as roles
RETURN u, 
       'SystemAdmin' IN roles as isSystemAdmin,
       'RealAssistantAdmin' IN roles as isRAAdmin,
       'Assistant' IN roles as isAssistant,
       'Customer' IN roles as isCustomer
```

This schema integrates seamlessly with the existing authentication system while providing all necessary structures for the RealAssistant platform.