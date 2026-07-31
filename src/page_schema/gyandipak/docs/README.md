# Gyandipak Contact Management System

A comprehensive contact management system built with SolidJS and Neo4j for organizing and managing contact information with user assignments.

## Overview

The Gyandipak contact management system provides:

### Core Features
- **Contact Import**: CSV/TSV import with automatic parsing and deduplication
- **Contact Management**: Full CRUD operations with search, filter, and sort capabilities
- **User Assignment**: Assign contacts to users with automatic user creation
- **Bulk Operations**: Select and process multiple contacts at once
- **Export Functionality**: Export selected contacts to CSV format
- **Real-time Updates**: Immediate UI updates after mutations
- **Pagination**: Configurable page sizes (10, 20, 50, 100 per page)

### Data Features
- **Contact Information**: Name, phone number, country, country code, remark
- **Status Tracking**: Called, IsUnavailable, NotInterested flags
- **User Relationships**: Many-to-many contact-user assignments
- **Duplicate Prevention**: Automatic detection during import and updates

## Graph Schema

The system uses a Neo4j graph database with the following structure:

```
(User)-[:UserContact]->(Contact)

Contact Properties:
- phoneNumber (unique identifier)
- name
- country
- countryCode
- remark
- called (boolean)
- isUnavailable (boolean)
- notInterested (boolean)
- createdAt (datetime)
- updatedAt (datetime)

User Properties:
- username (3 or 6 digit number)
- uuid (same as username)
- createdAt (datetime)
```

### Vertex Types

- **Contact**: Contact information
  - `phoneNumber`: string - Phone number (unique)
  - `name`: string - Contact name (saved name or display name)
  - `country`: string - Country name
  - `countryCode`: string - Country calling code
  - `remark`: string - Additional notes
  - `called`: boolean - Whether contact has been called
  - `isUnavailable`: boolean - Whether contact is unavailable
  - `notInterested`: boolean - Whether contact is not interested
  - `createdAt`: datetime - Creation timestamp
  - `updatedAt`: datetime - Last update timestamp

- **User**: System user
  - `username`: string - 3 or 6 digit number
  - `uuid`: string - Unique identifier (same as username)
  - `createdAt`: datetime - Creation timestamp

### Relationships

- **UserContact**: Connects users to their assigned contacts
  - `(User)-[:UserContact]->(Contact)`
  - When reassigning a contact to a new user, previous relationships are automatically removed

## File Structure

```
/src/page_schema/gyandipak/
├── components/
│   ├── layouts/
│   │   ├── LayoutContent.hjson          # Main navigation layout
│   │   └── AdminLayout.hjson            # Admin section layout
│   ├── forms/
│   │   ├── TextInput.hjson              # Text input component
│   │   ├── TomSelect.hjson              # Select dropdown component
│   │   └── ConfirmProvider.hjson        # Confirmation dialog provider
├── pages/
│   └── admin/
│       └── AdminContacts.hjson          # Main contact management page
├── functions/
│   ├── importContacts.hjson             # CSV import function
│   ├── getContactsWithUsers.hjson       # Fetch contacts with filters
│   ├── assignContactsToUser.hjson       # Assign contacts to user
│   ├── updateContactField.hjson         # Update single field (called, etc.)
│   ├── updateContact.hjson              # Update all contact details
│   ├── deleteContact.hjson              # Delete contact from database
│   ├── getAllUsernames.hjson            # Get all usernames for filter
│   ├── getAllCountries.hjson            # Get all countries for filter
│   └── signin.hjson                     # User authentication
└── docs/
    └── README.md                        # This documentation
```

## Component Structure

### AdminContacts Page

The main contact management page at `/gyandipak/admin/contacts` provides:

**State Management:**
- Reactive store using `_.createStore` for all UI state
- Automatic updates after mutations
- Optimistic UI updates with database sync

**Key Features:**
1. **Search & Filters**
   - Search by name, phone, or country (with button trigger)
   - Filter by assigned user (all, unassigned, or specific user)
   - Filter by country
   - Page size selector (10, 20, 50, 100)

2. **Bulk Operations**
   - Select all contacts on current page
   - Select first X contacts (configurable)
   - Clear selection
   - Assign selected contacts to user
   - Export selected contacts to CSV

3. **Table Features**
   - Sortable columns (Name, Phone, Country, Called, Unavailable, Not Interested)
   - Toggle checkboxes for status fields (real-time updates)
   - Edit button for full contact details
   - Delete button with confirmation
   - Displays assigned users for each contact
   - Remark column with truncation

4. **Pagination**
   - Previous/Next buttons
   - Page number navigation
   - Current page indicator
   - Shows X-Y of Z contacts

5. **Statistics**
   - Total Called count
   - Total Joined (users assigned) count

### Modals

**Assign to User Modal:**
- Username input (3 or 6 digits)
- Validates username format
- Creates user if doesn't exist
- Removes previous user assignments
- Shows success/error feedback

**Edit Contact Modal:**
- Name (required)
- Phone Number (required)
- Country
- Country Code
- Remark (textarea)
- Called, Unavailable, Not Interested checkboxes
- Duplicate phone number validation
- Returns updated vertex

**Select First X Modal:**
- Number input for quantity
- Validates positive number
- Selects specified number of contacts from top

## API Functions

### Contact Import
**Function:** `importContacts`
- Parses CSV/TSV string with quoted newline handling
- Detects delimiter automatically (tab or comma)
- Extracts: Country Code, Country, Display Name, Phone Number, Saved Name
- Uses saved name if available, falls back to display name
- Deduplicates within import data
- Checks existing contacts in database
- Batch creates new contacts using `UNWIND`
- Returns: created count, skipped count, total count

```javascript
// CSV Format:
// Country Code,Country,Contact's Public Display Name,Phone Number,Saved Name
// 91,India,John Doe,919876543210,John from XYZ

const result = await executeFunction("importContacts", {
  contacts: csvString  // Tab or comma separated
});
// Returns: { created: 150, skipped: 25, total: 175 }
```

### Contact Retrieval
**Function:** `getContactsWithUsers`
- Fetches contacts with assigned users
- Supports search, filters, sorting, pagination
- Returns contact and users vertices
- Provides total count and statistics

```javascript
const result = await executeFunction("getContactsWithUsers", {
  searchQuery: "John",           // Search in name, phone, country
  filterUsername: "123456",      // Filter by specific user
  filterCountry: "India",        // Filter by country
  sortBy: "name",                // name, phoneNumber, country, createdAt, called, isUnavailable, notInterested
  sortOrder: "asc",              // asc or desc
  limit: 20,                     // Page size
  offset: 0                      // Offset for pagination
});

// Filter Options:
// filterUsername: "" - All contacts
// filterUsername: "unassigned" - Contacts with no user assignments
// filterUsername: "123456" - Contacts assigned to user 123456
```

### User Assignment
**Function:** `assignContactsToUser`
- Assigns multiple contacts to a user
- Creates user if doesn't exist
- Removes previous UserContact relationships
- Creates new UserContact relationships
- Validates username format (3 or 6 digits, numbers only)

```javascript
const result = await executeFunction("assignContactsToUser", {
  username: "123456",
  contactIds: ["4:abc123:0", "4:def456:0"]  // Array of contact elementIds
});
```

### Field Updates
**Function:** `updateContactField`
- Updates single boolean field (called, isUnavailable, notInterested)
- Returns updated contact vertex
- Real-time UI updates

```javascript
const result = await executeFunction("updateContactField", {
  contactId: "4:abc123:0",      // Contact elementId
  field: "called",              // Field name
  value: true                   // New boolean value
});
```

### Full Contact Update
**Function:** `updateContact`
- Updates all contact details
- Validates phone number uniqueness
- Returns updated contact vertex

```javascript
const result = await executeFunction("updateContact", {
  contactId: "4:abc123:0",
  name: "John Doe",
  phoneNumber: "919876543210",
  country: "India",
  countryCode: "91",
  remark: "Important contact",
  called: true,
  isUnavailable: false,
  notInterested: false
});
```

### Contact Deletion
**Function:** `deleteContact`
- Deletes contact and all relationships
- Returns deletion count

```javascript
const result = await executeFunction("deleteContact", {
  contactId: "4:abc123:0"
});
```

### Filter Data
**Function:** `getAllUsernames`
- Returns all unique usernames with assigned contacts

```javascript
const result = await executeFunction("getAllUsernames", {});
// Returns: { usernames: ["123456", "789012"] }
```

**Function:** `getAllCountries`
- Returns all unique countries from contacts

```javascript
const result = await executeFunction("getAllCountries", {});
// Returns: { countries: ["India", "USA", "UK"] }
```

## Usage Patterns

### Importing Contacts
1. Navigate to import page
2. Paste CSV data (tab or comma separated)
3. System parses and validates data
4. Deduplicates phone numbers
5. Batch creates contacts in database
6. Shows import statistics

### Managing Contacts
1. Navigate to `/gyandipak/admin/contacts`
2. Use search to find specific contacts
3. Use filters to narrow down results
4. Sort by any column
5. Select contacts for bulk operations
6. Edit individual contacts
7. Track call status with toggle checkboxes

### Assigning Contacts
1. Select contacts using checkboxes
2. Click "Assign to User" button
3. Enter username (3 or 6 digits)
4. System creates user if needed
5. Previous assignments are removed
6. New assignments are created
7. UI updates automatically

### Exporting Contacts
1. Select contacts to export
2. Click "Export CSV" button
3. CSV file downloads automatically
4. Includes all contact details and assigned users

## State Management

The system uses `_.createStore` for reactive state management:

```javascript
const [store, setStore] = _.createStore({
  contacts: [],           // Array of contact data
  usernames: [],          // Available usernames for filter
  countries: [],          // Available countries for filter
  loading: false,         // Loading state
  searchQuery: '',        // Search input
  filterUsername: '',     // User filter value
  filterCountry: '',      // Country filter value
  selectedContacts: [],   // Selected contact IDs
  sortBy: 'createdAt',   // Sort field
  sortOrder: 'desc',     // Sort direction
  currentPage: 1,        // Current page number
  pageSize: 20,          // Items per page
  totalCount: 0,         // Total contacts
  stats: {               // Statistics
    totalCalled: 0,
    totalJoined: 0
  }
});
```

### State Categories
- **Data State**: Contacts, usernames, countries
- **UI State**: Loading, modals, error messages
- **Filter State**: Search, user filter, country filter
- **Selection State**: Selected contacts
- **Pagination State**: Page, size, total count
- **Sort State**: Sort field and direction

## Security & Validation

### Username Validation
- Must be 3 or 6 digits
- Must contain only numbers
- Username and password must match during signin
- UUID is same as username

### Contact Validation
- Phone number must be unique
- Name and phone number required
- Duplicate detection during import and update
- Empty/quoted values handled during import

### Database Operations
- Uses `elementId(c)` instead of deprecated `id(c)`
- Uses `_.neo4jDriver.int()` for integer parameters
- Proper transaction handling with `executeWrite`
- Atomic operations for data consistency

## Performance Optimizations

### Import Performance
- Batch creation using `UNWIND` for multiple contacts
- Single query for duplicate checking
- Efficient CSV parsing with proper quote handling

### Query Performance
- Indexed queries on common fields
- Pagination to limit result sets
- Filtered queries at database level
- Proper use of Neo4j integer types

### UI Performance
- Optimistic updates for instant feedback
- Debounced search (replaced with button trigger)
- Reactive state management
- Only render visible data

## Error Handling

### Import Errors
- Invalid CSV format
- Missing required columns
- Duplicate phone numbers

### User Errors
- Invalid username format
- Missing required fields
- Network failures

### Database Errors
- Connection issues
- Transaction failures
- Constraint violations

All errors show user-friendly toast notifications with appropriate messages.

## Development Guidelines

### Adding New Features
1. Create server function in `/functions/` directory
2. Update page state management as needed
3. Add UI components for user interaction
4. Test with edge cases
5. Update documentation

### Naming Conventions
- Server functions: camelCase (e.g., `importContacts`)
- Component files: PascalCase (e.g., `AdminContacts.hjson`)
- Database properties: camelCase (e.g., `phoneNumber`)
- Cypher variables: single letter or short names (e.g., `c` for contact)

### Database Best Practices
- Always use `elementId()` for node identity
- Use transactions for multi-step operations
- Use `MERGE` for idempotent operations
- Use `UNWIND` for batch operations
- Use `_.neo4jDriver.int()` for integers
- Include timestamps (createdAt, updatedAt)

## Future Enhancements

### Planned Features
- Call history tracking
- SMS integration
- Contact groups/tags
- Advanced search with filters
- Contact notes history
- Activity timeline
- Import from multiple formats
- Automatic user assignment rules
- Contact merge functionality
- Bulk edit capabilities

### Data Enhancements
- Contact validation rules
- Custom fields
- Contact categories
- Priority levels
- Follow-up reminders
- Last contact date tracking

### UI Enhancements
- Advanced filtering UI
- Bulk edit modal
- Contact details view
- Activity feed
- Dashboard with analytics
- Export to multiple formats
- Import preview before saving

This documentation serves as the foundation for the Gyandipak contact management system and should be referenced for all development decisions.
