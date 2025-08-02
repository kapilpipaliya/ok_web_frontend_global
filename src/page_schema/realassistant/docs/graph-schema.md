# RealAssistant Graph Database Schema

## Overview
This document defines the Neo4j graph database schema for RealAssistant. The schema is designed to be flexible and expandable for future features while maintaining data integrity and query performance.

## Core Node Types (Labels)

### 1. User
**Purpose**: Represents all users in the system (customers, assistants, admins)
```cypher
(:User {
  id: string,           // UUID
  email: string,        // Unique, indexed
  password: string,     // Hashed
  name: string,
  phoneNumber: string?, // Optional
  avatarUrl: string?,
  isActive: boolean,
  isVerified: boolean,
  createdAt: datetime,
  updatedAt: datetime,
  lastLoginAt: datetime?,
  metadata: string?     // JSON string for extensibility
})
```

### 2. Role
**Purpose**: Defines user roles and permissions
```cypher
(:Role {
  id: string,
  key: string,          // "USER", "ASSISTANT", "ADMIN", "SUPER_ADMIN"
  name: string,
  description: string,
  isSystem: boolean,    // Cannot be deleted
  createdAt: datetime
})
```

### 3. Balance
**Purpose**: Tracks user balance (separate for audit trail)
```cypher
(:Balance {
  id: string,
  amount: float,
  currency: string,     // "USD", etc.
  lastUpdated: datetime
})
```

### 4. Problem
**Purpose**: User-submitted problems
```cypher
(:Problem {
  id: string,
  title: string,
  description: string,
  category: string,
  urgency: string,      // "normal", "urgent"
  status: string,       // "pending", "assigned", "in_progress", "solution_provided", "completed", "disputed", "cancelled"
  estimatedCost: float,
  actualCost: float?,
  createdAt: datetime,
  updatedAt: datetime,
  assignedAt: datetime?,
  completedAt: datetime?,
  metadata: string?     // For future fields
})
```

### 5. Solution
**Purpose**: Solutions provided by assistants
```cypher
(:Solution {
  id: string,
  content: string,
  isApproved: boolean?,
  approvedAt: datetime?,
  rejectedAt: datetime?,
  rejectionReason: string?,
  createdAt: datetime,
  updatedAt: datetime
})
```

### 6. Transaction
**Purpose**: Financial transactions
```cypher
(:Transaction {
  id: string,
  type: string,         // "recharge", "payment", "refund", "bonus", "withdrawal"
  amount: float,
  currency: string,
  status: string,       // "pending", "completed", "failed", "cancelled"
  description: string,
  paymentMethod: string?,
  paymentReference: string?,
  createdAt: datetime,
  processedAt: datetime?,
  metadata: string?     // Payment gateway details
})
```

### 7. Category
**Purpose**: Problem categories with pricing
```cypher
(:Category {
  id: string,
  key: string,          // "tech", "education", etc.
  name: string,
  description: string,
  basePrice: float,
  isActive: boolean,
  order: integer,
  icon: string?,
  createdAt: datetime,
  updatedAt: datetime
})
```

### 8. Message
**Purpose**: Communication between users and assistants
```cypher
(:Message {
  id: string,
  content: string,
  type: string,         // "text", "system", "attachment"
  isRead: boolean,
  createdAt: datetime,
  metadata: string?     // Attachment info, etc.
})
```

### 9. Rating
**Purpose**: User ratings for assistants
```cypher
(:Rating {
  id: string,
  score: integer,       // 1-5
  comment: string?,
  createdAt: datetime
})
```

### 10. Expertise
**Purpose**: Assistant areas of expertise
```cypher
(:Expertise {
  id: string,
  key: string,
  name: string,
  description: string
})
```

## Relationship Types

### User Relationships
```cypher
// User roles
(u:User)-[:HAS_ROLE]->(r:Role)

// User balance
(u:User)-[:HAS_BALANCE]->(b:Balance)

// User problems
(u:User)-[:SUBMITTED]->(p:Problem)

// Assistant assignments
(a:User)-[:ASSIGNED_TO]->(p:Problem)

// User transactions
(u:User)-[:MADE_TRANSACTION]->(t:Transaction)

// Assistant expertise
(a:User)-[:HAS_EXPERTISE {level: integer}]->(e:Expertise)
```

### Problem Relationships
```cypher
// Problem category
(p:Problem)-[:IN_CATEGORY]->(c:Category)

// Problem solution
(p:Problem)-[:HAS_SOLUTION]->(s:Solution)

// Solution author
(s:Solution)-[:PROVIDED_BY]->(a:User)

// Problem messages
(p:Problem)-[:HAS_MESSAGE]->(m:Message)

// Message sender
(m:Message)-[:SENT_BY]->(u:User)

// Problem rating
(p:Problem)-[:HAS_RATING]->(r:Rating)

// Rating author
(r:Rating)-[:RATED_BY]->(u:User)

// Rating target
(r:Rating)-[:RATING_FOR]->(a:User)
```

### Transaction Relationships
```cypher
// Transaction related to problem
(t:Transaction)-[:FOR_PROBLEM]->(p:Problem)

// Transaction affects balance
(t:Transaction)-[:UPDATES_BALANCE]->(b:Balance)

// Recharge transaction
(t:Transaction)-[:RECHARGE_FOR]->(u:User)
```

## Indexes and Constraints

### Unique Constraints
```cypher
CREATE CONSTRAINT user_email_unique ON (u:User) ASSERT u.email IS UNIQUE;
CREATE CONSTRAINT user_id_unique ON (u:User) ASSERT u.id IS UNIQUE;
CREATE CONSTRAINT role_key_unique ON (r:Role) ASSERT r.key IS UNIQUE;
CREATE CONSTRAINT category_key_unique ON (c:Category) ASSERT c.key IS UNIQUE;
CREATE CONSTRAINT expertise_key_unique ON (e:Expertise) ASSERT e.key IS UNIQUE;
```

### Performance Indexes
```cypher
CREATE INDEX user_email FOR (u:User) ON (u.email);
CREATE INDEX user_active FOR (u:User) ON (u.isActive);
CREATE INDEX problem_status FOR (p:Problem) ON (p.status);
CREATE INDEX problem_created FOR (p:Problem) ON (p.createdAt);
CREATE INDEX transaction_type FOR (t:Transaction) ON (t.type);
CREATE INDEX transaction_status FOR (t:Transaction) ON (t.status);
CREATE INDEX message_created FOR (m:Message) ON (m.createdAt);
```

## Common Query Patterns

### User Authentication
```cypher
MATCH (u:User {email: $email, isActive: true})-[:HAS_ROLE]->(r:Role)
RETURN u, r
```

### Get User Dashboard Data
```cypher
MATCH (u:User {id: $userId})-[:HAS_BALANCE]->(b:Balance)
OPTIONAL MATCH (u)-[:SUBMITTED]->(p:Problem)
WHERE p.status IN ['pending', 'assigned', 'in_progress', 'solution_provided']
OPTIONAL MATCH (u)-[:MADE_TRANSACTION]->(t:Transaction)
WHERE t.createdAt > datetime() - duration('P30D')
RETURN u, b, collect(DISTINCT p) as activeProblems, collect(DISTINCT t) as recentTransactions
```

### Submit New Problem
```cypher
MATCH (u:User {id: $userId}), (c:Category {key: $categoryKey})
CREATE (p:Problem {
  id: $problemId,
  title: $title,
  description: $description,
  urgency: $urgency,
  status: 'pending',
  estimatedCost: $estimatedCost,
  createdAt: datetime()
})
CREATE (u)-[:SUBMITTED]->(p)
CREATE (p)-[:IN_CATEGORY]->(c)
RETURN p
```

### Assign Assistant to Problem
```cypher
MATCH (p:Problem {id: $problemId}), (a:User {id: $assistantId})
WHERE EXISTS((a)-[:HAS_ROLE]->(:Role {key: 'ASSISTANT'}))
CREATE (a)-[:ASSIGNED_TO]->(p)
SET p.status = 'assigned', p.assignedAt = datetime()
RETURN p, a
```

### Process Payment
```cypher
MATCH (u:User {id: $userId})-[:HAS_BALANCE]->(b:Balance),
      (p:Problem {id: $problemId})
CREATE (t:Transaction {
  id: $transactionId,
  type: 'payment',
  amount: $amount,
  status: 'completed',
  createdAt: datetime()
})
CREATE (u)-[:MADE_TRANSACTION]->(t)
CREATE (t)-[:FOR_PROBLEM]->(p)
CREATE (t)-[:UPDATES_BALANCE]->(b)
SET b.amount = b.amount - $amount,
    b.lastUpdated = datetime(),
    p.status = 'completed',
    p.completedAt = datetime()
RETURN t, b
```

## Future Expansion Patterns

### 1. Subscription System
```cypher
// New node type
(:Subscription {
  id: string,
  plan: string,
  status: string,
  startDate: datetime,
  endDate: datetime,
  features: string // JSON
})

// Relationships
(u:User)-[:HAS_SUBSCRIPTION]->(s:Subscription)
(s:Subscription)-[:INCLUDES_CATEGORY]->(c:Category)
```

### 2. Team/Organization Support
```cypher
// New node type
(:Organization {
  id: string,
  name: string,
  type: string,
  settings: string // JSON
})

// Relationships
(u:User)-[:BELONGS_TO {role: string}]->(o:Organization)
(o:Organization)-[:OWNS_PROBLEM]->(p:Problem)
(o:Organization)-[:HAS_BALANCE]->(b:Balance)
```

### 3. Problem Templates
```cypher
// New node type
(:Template {
  id: string,
  name: string,
  structure: string, // JSON
  isPublic: boolean
})

// Relationships
(u:User)-[:CREATED_TEMPLATE]->(t:Template)
(p:Problem)-[:BASED_ON_TEMPLATE]->(t:Template)
(t:Template)-[:FOR_CATEGORY]->(c:Category)
```

### 4. Assistant Availability
```cypher
// New node type
(:Schedule {
  id: string,
  dayOfWeek: integer,
  startTime: time,
  endTime: time,
  timezone: string
})

// Relationships
(a:User)-[:HAS_SCHEDULE]->(s:Schedule)
(p:Problem)-[:REQUIRES_AVAILABILITY]->(s:Schedule)
```

### 5. Knowledge Base
```cypher
// New node types
(:Article {
  id: string,
  title: string,
  content: string,
  isPublished: boolean
})

(:Tag {
  id: string,
  name: string
})

// Relationships
(a:Article)-[:TAGGED_WITH]->(t:Tag)
(a:Article)-[:RELATED_TO_CATEGORY]->(c:Category)
(a:Article)-[:AUTHORED_BY]->(u:User)
(p:Problem)-[:REFERENCES_ARTICLE]->(a:Article)
```

### 6. Notification System
```cypher
// New node type
(:Notification {
  id: string,
  type: string,
  title: string,
  content: string,
  isRead: boolean,
  createdAt: datetime
})

// Relationships
(u:User)-[:HAS_NOTIFICATION]->(n:Notification)
(n:Notification)-[:RELATED_TO_PROBLEM]->(p:Problem)
(n:Notification)-[:TRIGGERED_BY_USER]->(u2:User)
```

## Migration Patterns

### Adding New Properties
```cypher
// Add property with default value
MATCH (u:User)
WHERE NOT EXISTS(u.preferences)
SET u.preferences = '{}'
```

### Creating New Relationships
```cypher
// Link existing data
MATCH (p:Problem), (c:Category)
WHERE p.category = c.key AND NOT EXISTS((p)-[:IN_CATEGORY]->(c))
CREATE (p)-[:IN_CATEGORY]->(c)
```

### Archiving Old Data
```cypher
// Move old problems to archive
MATCH (p:Problem)
WHERE p.completedAt < datetime() - duration('P365D')
SET p:ArchivedProblem
REMOVE p:Problem
```

## Best Practices

### 1. ID Generation
- Use UUIDs for all node IDs
- Never expose internal Neo4j IDs
- Consider using prefixed IDs (e.g., "usr_", "prb_", "txn_")

### 2. Timestamps
- Always include createdAt
- Add updatedAt where mutations occur
- Use datetime() function for consistency

### 3. Status Management
- Use string enums for statuses
- Document all possible status values
- Consider status history tracking for audit

### 4. Metadata Fields
- Use JSON strings in metadata fields for flexibility
- Document metadata structure
- Validate JSON before storage

### 5. Relationship Properties
- Keep relationship properties minimal
- Use for relationship-specific data only
- Consider creating intermediate nodes for complex relationships

### 6. Query Optimization
- Create indexes for frequently queried properties
- Use parameters in queries to enable query caching
- Limit result sets with LIMIT clause
- Use EXISTS() for relationship checks

## Security Considerations

### 1. Access Control
```cypher
// Always verify user has access to resource
MATCH (u:User {id: $userId})-[:SUBMITTED|ASSIGNED_TO]->(p:Problem {id: $problemId})
// User can only access their own problems or assigned problems
```

### 2. Data Validation
- Validate all input data before storage
- Use constraints to enforce data integrity
- Sanitize string inputs to prevent injection

### 3. Sensitive Data
- Hash passwords with bcrypt or similar
- Encrypt payment information
- Consider data retention policies

This schema provides a solid foundation for RealAssistant while maintaining flexibility for future enhancements. The graph structure naturally represents the relationships between users, problems, and solutions, making complex queries efficient and intuitive.