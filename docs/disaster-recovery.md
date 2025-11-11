# Disaster Recovery Runbook

## Overview

This runbook provides step-by-step procedures for recovering from various disaster scenarios. Follow these procedures carefully to restore your application and data with minimal downtime.

**📱 EMERGENCY CONTACTS**
```
System Administrator: ___________________________
Phone: ___________________________
Email: ___________________________

Backup Administrator: ___________________________
Phone: ___________________________
Email: ___________________________

Cloud Provider Support: ___________________________
Account ID: ___________________________
```

---

## Disaster Scenarios Quick Reference

| Scenario | Severity | Expected RTO | Expected RPO | Go To |
|----------|----------|--------------|--------------|-------|
| Complete Database Loss | 🔴 Critical | 2-4 hours | Last backup | [Scenario 1](#scenario-1-complete-database-loss) |
| Single Database Corruption | 🟡 High | 30-60 min | Last backup | [Scenario 2](#scenario-2-single-database-corruption) |
| Backup System Failure | 🟡 High | 15-30 min | N/A | [Scenario 3](#scenario-3-backup-system-failure) |
| Cloud Storage Issues | 🟡 High | 1-2 hours | Last backup | [Scenario 4](#scenario-4-cloud-storage-access-issues) |
| Accidental Data Deletion | 🟢 Medium | 30-60 min | Last backup | [Scenario 5](#scenario-5-accidental-data-deletion) |

**RTO** = Recovery Time Objective (time to restore service)
**RPO** = Recovery Point Objective (acceptable data loss)

---

## Decision Tree: What Happened?

```
START: What is the problem?
  |
  ├─> Neo4j database won't start
  |   └─> Go to: Scenario 1 (Complete Database Loss)
  |
  ├─> Neo4j works but data is corrupted/missing
  |   └─> Go to: Scenario 2 (Single Database Corruption)
  |
  ├─> Backups not running/failing
  |   └─> Go to: Scenario 3 (Backup System Failure)
  |
  ├─> Cannot access cloud storage
  |   └─> Go to: Scenario 4 (Cloud Storage Issues)
  |
  └─> User deleted important data
      └─> Go to: Scenario 5 (Accidental Deletion)
```

---

## Pre-Recovery Checklist

Before starting any recovery procedure:

- [ ] **STOP** - Don't panic. Read this entire section before taking action.
- [ ] **DOCUMENT** - Take screenshots/notes of error messages and current state
- [ ] **NOTIFY** - Alert relevant stakeholders about the incident
- [ ] **ASSESS** - Determine which scenario matches your situation
- [ ] **BACKUP CURRENT STATE** - If possible, backup corrupted data before recovery
- [ ] **VERIFY BACKUPS** - Confirm backup files are accessible in cloud storage
- [ ] **PREPARE WORKSPACE** - Ensure you have necessary credentials and access

⚠️ **IMPORTANT**: Never delete or overwrite existing data until recovery is successful!

---

## Scenario 1: Complete Database Loss

**When to use**: Neo4j database is completely lost or unrecoverable

**Severity**: 🔴 Critical
**Estimated Time**: 2-4 hours
**Data Loss**: Back to last backup (typically max 24 hours)

### Step 1: Assess the Situation

```bash
# Check Neo4j status
sudo systemctl status neo4j

# Check database files
ls -lh /var/lib/neo4j/data/databases/

# Check available disk space
df -h
```

**Decision Point**: Can Neo4j be repaired?
- ✅ Yes → Try Neo4j repair tools first, then return here if unsuccessful
- ❌ No → Continue to Step 2

### Step 2: Stop All Services

```bash
# Stop application
npm run stop
# or
pm2 stop all

# Stop Neo4j
sudo systemctl stop neo4j

# Verify all stopped
ps aux | grep node
ps aux | grep neo4j
```

### Step 3: List Available Backups

**Option 1: Via Backup Management UI (Recommended)**

1. Navigate to `http://admin.localhost.com:3001/system/GlobalSettings?tab=backup`
2. Scroll to "Cloud Backups" section
3. Review the table showing all available backups with:
   - Filename (with timestamp)
   - Database name
   - File size
   - Creation date
4. Document the backup you plan to restore

**Option 2: Via TypeScript Function**

```typescript
const result = await executeNamedServerFunction({
  functionName: 'listCloudBackups',
  contextData: {}
});

console.log('Available backups:', result.data.backups);
```

**Option 3: Via CLI**

```bash
# AWS S3
aws s3 ls s3://your-backup-bucket/ --recursive

# Google Cloud Storage
gsutil ls -r gs://your-backup-bucket/
```

**Select the backup to restore:**
- Latest backup: Use most recent successful backup
- Point-in-time: Use backup from specific date/time
- Document backup timestamp for records

### Step 4: Prepare Neo4j for Restoration

```bash
# Backup corrupted database (if possible)
sudo mv /var/lib/neo4j/data/databases /var/lib/neo4j/data/databases.corrupted.$(date +%Y%m%d)

# Create fresh database directories
sudo mkdir -p /var/lib/neo4j/data/databases
sudo chown -R neo4j:neo4j /var/lib/neo4j/data/databases
```

### Step 5: Restore Admin Database

**Option 1: Via Backup Management UI (Recommended)**

1. Navigate to `http://admin.localhost.com:3001/system/GlobalSettings?tab=backup`
2. Find the admin database backup in the "Cloud Backups" table
3. Click the "Restore" button (⚠️ warning color)
4. In the restore modal:
   - **Verify** the source backup filename
   - **Verify** the original database is "admin"
   - **Leave target database empty** (to restore to original "admin" database)
   - **Read the warning**: This will DELETE all existing data!
   - **Check the confirmation box**: "I understand this will DELETE all data"
   - **Click** "⚠️ Restore Database" button
5. **Wait for completion**: Button will show spinner and "Restoring..." text
6. **Watch for notification**: Success/error toast will appear when complete

**Option 2: Via TypeScript Function**

```typescript
const restoreResult = await args.restoreFromBackup({
  filename: 'admin-20250111-020000-daily.dump.gz',  // Use actual filename from Step 3
  sourceDatabaseName: 'admin',
  targetDatabaseName: 'admin',
  confirmed: true,  // ⚠️ REQUIRED - Data will be deleted!
  sendEmail: args.sendEmail,
  subDomain: args.subDomain
});

console.log('Restore result:', restoreResult);
```

**Monitor restoration progress:**
- UI: Watch the spinner on the restore button
- Logs: Check console logs for progress updates (Step 1/6 through Step 6/6)
- Duration: Restoration may take 10-60 minutes depending on database size
- ⚠️ **Do not interrupt the process** - modal cannot be closed during restoration

### Step 6: Verify Admin Database

```bash
# Start Neo4j
sudo systemctl start neo4j

# Wait for Neo4j to be ready (30-60 seconds)
sleep 60

# Connect to Neo4j
cypher-shell -u neo4j -p YourPassword123! -d admin
```

```cypher
// Verify data
MATCH (n) RETURN count(n) as nodeCount;
MATCH ()-[r]->() RETURN count(r) as edgeCount;

// Check critical data
MATCH (u:User) RETURN count(u) as users;
MATCH (s:SubDomain) RETURN s.key, s.status;

// Exit
:exit
```

**Decision Point**: Is admin database healthy?
- ✅ Yes → Continue to Step 7
- ❌ No → Try alternative backup, or escalate to senior admin

### Step 7: Restore Subdomain Databases

For each subdomain database:

```typescript
// List subdomains from admin database
const subdomainsResult = await session.run(`
  MATCH (s:SubDomain)
  WHERE s.status = 'active'
  RETURN s.key as subdomain
`);

// Restore each subdomain
for (const record of subdomainsResult.records) {
  const subdomain = record.get('subdomain');

  console.log(`Restoring subdomain: ${subdomain}`);

  const restoreResult = await executeNamedServerFunction({
    functionName: 'restoreFromBackup',
    contextData: {
      filename: `${subdomain}-20250111-020000-daily.dump.gz`,  // Adjust timestamp
      sourceDatabaseName: subdomain,
      targetDatabaseName: subdomain,
      confirmed: true
    }
  });

  console.log(`${subdomain} restore result:`, restoreResult);

  // Wait between restores to avoid overload
  await new Promise(resolve => setTimeout(resolve, 5000));
}
```

### Step 8: Start Application Services

```bash
# Start application
npm run start
# or
pm2 start all

# Check logs for errors
tail -f logs/application.log
# or
pm2 logs
```

### Step 9: Verify Application Health

**System Health Checks:**

```bash
# Check HTTP endpoints
curl http://localhost:3000/api/health

# Check Neo4j connections
curl http://localhost:3000/api/db/health

# Check Redis
redis-cli PING
```

**Functional Testing:**

1. **Authentication**:
   - Navigate to login page
   - Log in with admin credentials
   - Verify session works

2. **Database Access**:
   - Access admin dashboard
   - Check subdomain switching
   - Verify data displays correctly

3. **Critical Features**:
   - Test page loading
   - Test data retrieval
   - Test file access
   - Test form submissions

### Step 10: Post-Recovery Tasks

- [ ] Document incident in recovery log
- [ ] Update backup verification date
- [ ] Notify stakeholders of recovery completion
- [ ] Schedule post-mortem meeting
- [ ] Review and update disaster recovery procedures

**Recovery Log Template:**
```
Incident Date: ________________
Recovery Start: ________________
Recovery End: ________________
Total Downtime: ________________
Data Loss: ________________ (hours/days)
Root Cause: ________________________________
Restored From: ________________________________
Team Members Involved: ________________________________
Lessons Learned: ________________________________
Action Items: ________________________________
```

---

## Scenario 2: Single Database Corruption

**When to use**: One database is corrupted, but others are functioning

**Severity**: 🟡 High
**Estimated Time**: 30-60 minutes
**Data Loss**: Back to last backup for affected database only

### Step 1: Identify Corrupted Database

```cypher
// Connect to system database
cypher-shell -u neo4j -p YourPassword123! -d system

// Show all databases
SHOW DATABASES;

// Identify corrupted database
// Look for status = 'offline' or errors
```

Document the corrupted database name: `___________________________`

### Step 2: Isolate the Problem

```bash
# Stop application workers for affected subdomain
# (If corruption is in subdomain database)

# Via application code or direct Neo4j:
cypher-shell -u neo4j -p YourPassword123! -d system
```

```cypher
// Take database offline
STOP DATABASE corrupted_db_name;

// Verify it's stopped
SHOW DATABASES;
```

### Step 3: Backup Current State (If Possible)

Even corrupted data might be partially recoverable:

```bash
# Try to dump current state
neo4j-admin dump --database=corrupted_db_name \
  --to=/var/backups/corrupted_db_name-$(date +%Y%m%d-%H%M%S).dump
```

If this fails, proceed anyway.

### Step 4: Restore from Backup

**Option 1: Via Backup Management UI (Recommended)**

1. Navigate to `http://admin.localhost.com:3001/system/GlobalSettings?tab=backup`
2. Find the most recent backup for the corrupted database in "Cloud Backups" table
3. Click the "Restore" button
4. In the restore modal:
   - Confirm the source backup and database name
   - Leave target database empty (to restore to same database)
   - Check the confirmation box
   - Click "⚠️ Restore Database"
5. Wait for completion (spinner will show progress)

**Option 2: Via TypeScript Function**

```typescript
// Find latest backup for corrupted database
const backupsList = await executeNamedServerFunction({
  functionName: 'listCloudBackups',
  contextData: {}
});

// Filter backups for corrupted database
const dbBackups = backupsList.data.backups.filter(
  b => b.databaseName === 'corrupted_db_name'
);

// Sort by date, get most recent
const latestBackup = dbBackups.sort((a, b) =>
  new Date(b.timestamp) - new Date(a.timestamp)
)[0];

console.log('Restoring from:', latestBackup.filename);

// Restore
const restoreResult = await args.restoreFromBackup({
  filename: latestBackup.filename,
  sourceDatabaseName: 'corrupted_db_name',
  targetDatabaseName: 'corrupted_db_name',
  confirmed: true,
  sendEmail: args.sendEmail,
  subDomain: args.subDomain
});

console.log('Restore result:', restoreResult);
```

### Step 5: Verify Restored Database

```cypher
// Connect to restored database
cypher-shell -u neo4j -p YourPassword123! -d corrupted_db_name

// Verify data
MATCH (n) RETURN count(n) as nodeCount;
MATCH ()-[r]->() RETURN count(r) as edgeCount;

// Check critical entities
MATCH (n) RETURN DISTINCT labels(n) as labels, count(n) as count;
```

### Step 6: Bring Database Online

```cypher
// Switch to system database
:use system

// Start restored database
START DATABASE corrupted_db_name;

// Verify it's online
SHOW DATABASES;
```

### Step 7: Restart Application Services

```bash
# Restart application to reconnect to restored database
pm2 restart all

# Check logs
pm2 logs --lines 100
```

### Step 8: Verify Application Functionality

Test the affected subdomain/functionality:
- [ ] Can access the subdomain
- [ ] Data displays correctly
- [ ] Forms work properly
- [ ] No console errors

### Step 9: Document Recovery

Update incident log with:
- Affected database
- Restoration timestamp
- Data loss timeframe
- Root cause (if known)

---

## Scenario 3: Backup System Failure

**When to use**: Automated backups are failing or not running

**Severity**: 🟡 High (no immediate data loss, but no protection)
**Estimated Time**: 15-30 minutes

### Step 1: Check Backup System Status

Navigate to Backup Management page:
```
http://admin.localhost.com:3001/system/GlobalSettings?tab=backup
```

Look for:
- Backup Status section showing Enabled/Disabled
- Last Successful Backup timestamp
- Last Failed Backup (if any) with error details
- Total Completed and Failed counts
- Schedule and storage type configuration

### Step 2: Check Recent Backups

```bash
# AWS S3
aws s3 ls s3://your-backup-bucket/ --recursive | tail -n 20

# Google Cloud Storage
gsutil ls -lh gs://your-backup-bucket/** | tail -n 20
```

**Decision Point**: When was the last successful backup?
- < 24 hours ago → Low urgency, continue diagnostics
- > 24 hours ago → High urgency, run manual backup immediately

### Step 3: Run Manual Backup

**Option 1: Via Backup Management UI (Recommended)**

1. Navigate to `http://admin.localhost.com:3001/system/GlobalSettings?tab=backup`
2. In the "Databases / Subdomains" table, find each critical database
3. Click "📦 Create Backup" for each database (starting with admin)
4. Wait for success notification
5. Verify backups appear in "Cloud Backups" table below
6. Click "🔄 Refresh" button to see latest backups

**Option 2: Via TypeScript Function**

```typescript
// Trigger manual backup for critical databases
await executeNamedServerFunction({
  functionName: 'createDatabaseBackup',
  contextData: {
    databaseName: 'admin',
    backupType: 'manual'
  }
});

// Wait and verify
setTimeout(async () => {
  const backups = await executeNamedServerFunction({
    functionName: 'listCloudBackups',
    contextData: {}
  });

  console.log('Recent backups:', backups.data.backups.slice(0, 5));
}, 60000);
```

### Step 4: Diagnose Worker Failure

Check common issues:

**A. Redis Connection Issues**
```bash
# Test Redis connection
redis-cli PING

# Check Redis memory
redis-cli INFO memory

# Check Redis keys
redis-cli KEYS "*backgroundBackupDatabase*"
```

**B. Environment Variables**
```bash
# Verify backup is enabled
grep BACKUP_ENABLED .env

# Verify storage credentials
grep AWS_ACCESS_KEY_ID .env  # (partial match only, don't print full keys!)
grep GCS_BUCKET .env
```

**C. Cloud Storage Access**
```bash
# Test S3 access
aws s3 ls s3://your-backup-bucket/ --region us-east-1

# Test GCS access
gsutil ls gs://your-backup-bucket/
```

**D. Application Logs**
```bash
# Search for backup errors
grep -i "backup" logs/application.log | tail -n 50
grep -i "error" logs/application.log | grep -i "backup"
```

### Step 5: Fix Identified Issues

Based on diagnostics, apply fixes:

**Redis Issues:**
```bash
# Restart Redis
sudo systemctl restart redis

# Increase memory if needed
redis-cli CONFIG SET maxmemory 2gb
```

**Credentials Issues:**
```bash
# Update .env with correct credentials
nano .env

# Restart application
pm2 restart all
```

**Storage Access Issues:**
```bash
# Re-authenticate AWS CLI
aws configure

# Re-authenticate GCS
gcloud auth login
```

### Step 6: Restart Backup Worker

```bash
# Restart application to reinitialize workers
pm2 restart all

# Check logs for worker initialization
pm2 logs | grep -i "backup worker"
```

### Step 7: Verify Backup Restored

Wait for next scheduled backup or trigger manual backup:

```typescript
await executeNamedServerFunction({
  functionName: 'createDatabaseBackup',
  contextData: {
    databaseName: 'admin',
    backupType: 'daily'
  }
});
```

Check email for success notification.

### Step 8: Monitor for 48 Hours

- [ ] Check backups run successfully next 2 cycles
- [ ] Verify cloud storage shows new backups
- [ ] Confirm email alerts are sent
- [ ] Update monitoring documentation

---

## Scenario 4: Cloud Storage Access Issues

**When to use**: Cannot access cloud storage (S3/GCS) where backups are stored

**Severity**: 🟡 High
**Estimated Time**: 1-2 hours

### Step 1: Verify the Issue

```bash
# Test S3 access
aws s3 ls s3://your-backup-bucket/ 2>&1 | tee /tmp/s3-test.log

# Test GCS access
gsutil ls gs://your-backup-bucket/ 2>&1 | tee /tmp/gcs-test.log
```

Common error messages:
- `403 Forbidden` → Credentials/permissions issue
- `404 Not Found` → Bucket doesn't exist or wrong region
- `Connection timeout` → Network/firewall issue
- `Invalid credentials` → Authentication issue

### Step 2: Check Credentials

```bash
# Verify credentials are set
env | grep AWS_
env | grep GCS_

# Test credentials directly
# For AWS:
aws sts get-caller-identity

# For GCS:
gcloud auth list
```

### Step 3: Fix Authentication

**For AWS S3:**

```bash
# Re-configure AWS CLI
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Output format (json)

# Test access
aws s3 ls s3://your-backup-bucket/

# Update .env file
nano .env
# Verify:
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# AWS_S3_BUCKET=...
# AWS_S3_REGION=...
```

**For Google Cloud Storage:**

```bash
# Re-authenticate
gcloud auth login

# Set project
gcloud config set project your-project-id

# Test access
gsutil ls gs://your-backup-bucket/

# Verify service account key
ls -l /path/to/service-account-key.json

# Update .env file
nano .env
# Verify:
# GCS_PROJECT_ID=...
# GCS_BUCKET=...
# GCS_KEYFILE_PATH=...
```

### Step 4: Check Permissions

**For AWS S3:**

Verify IAM policy includes:
- `s3:PutObject`
- `s3:GetObject`
- `s3:DeleteObject`
- `s3:ListBucket`

```bash
# Check user permissions (requires admin access)
aws iam list-attached-user-policies --user-name backup-system
aws iam get-user-policy --user-name backup-system --policy-name BackupPolicy
```

**For GCS:**

Verify service account has role: **Storage Object Admin**

```bash
# Check service account permissions
gcloud projects get-iam-policy your-project-id \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:serviceAccount:backup-system@your-project-id.iam.gserviceaccount.com"
```

### Step 5: Check Network/Firewall

```bash
# Test connectivity to AWS S3
curl -I https://s3.amazonaws.com

# Test connectivity to GCS
curl -I https://storage.googleapis.com

# Check DNS resolution
nslookup s3.amazonaws.com
nslookup storage.googleapis.com
```

If connectivity fails:
- Check firewall rules
- Verify outbound HTTPS (443) is allowed
- Check proxy settings

### Step 6: Verify Bucket Exists

```bash
# AWS S3 - List all buckets
aws s3 ls

# GCS - List all buckets
gsutil ls

# Verify bucket region (AWS only)
aws s3api get-bucket-location --bucket your-backup-bucket
```

**If bucket doesn't exist:**
- Check bucket name spelling
- Verify correct AWS region
- Check if bucket was accidentally deleted
- Restore from different region/account if available

### Step 7: Alternative Access Methods

If primary credentials fail, try alternative:

**AWS S3 Alternative:**
```bash
# Use AWS Console to download backups manually
# Navigate to: https://s3.console.aws.amazon.com/
# Download backups to local system
# Store in /tmp/emergency-backups/
```

**GCS Alternative:**
```bash
# Use GCS Console
# Navigate to: https://console.cloud.google.com/storage/
# Download backups manually
```

### Step 8: Restore Service

```bash
# Restart application with fixed credentials
pm2 restart all

# Test backup function
```

```typescript
await executeNamedServerFunction({
  functionName: 'uploadBackupToCloud',
  contextData: {
    localPath: '/path/to/test-file.txt',
    filename: 'test-upload.txt',
    databaseName: 'test'
  }
});
```

### Step 9: Document Resolution

Update runbook with:
- Root cause of storage access issue
- Resolution steps taken
- Prevention measures
- Monitoring improvements needed

---

## Scenario 5: Accidental Data Deletion

**When to use**: User or process accidentally deleted important data

**Severity**: 🟢 Medium
**Estimated Time**: 30-60 minutes
**Data Loss**: Depends on backup frequency

### Step 1: Stop Further Changes

**Immediately:**
1. Identify affected database/subdomain
2. If possible, pause application access to prevent more changes
3. Document what was deleted (if known)

### Step 2: Assess Damage

```cypher
// Connect to affected database
cypher-shell -u neo4j -p YourPassword123! -d affected_database

// Check for deleted data
MATCH (n) WHERE n.deletedAt IS NOT NULL
RETURN labels(n) as type, count(n) as count;

// Check transaction logs (if available)
// Neo4j Enterprise only
```

**Decision Point**: How critical is the deleted data?
- ✅ Can recreate manually → Do so instead of full restore
- ❌ Cannot recreate → Proceed with backup restore

### Step 3: Find Appropriate Backup

```typescript
// List backups
const backups = await executeNamedServerFunction({
  functionName: 'listCloudBackups',
  contextData: {}
});

// Filter for affected database
const dbBackups = backups.data.backups.filter(
  b => b.databaseName === 'affected_database'
);

// Find backup before deletion occurred
// User must know approximately when deletion happened
console.log('Available backups:', dbBackups.map(b => ({
  filename: b.filename,
  timestamp: b.timestamp,
  size: b.sizeFormatted
})));
```

Select backup timestamp before deletion: `___________________________`

### Step 4: Restore to Test Database First

⚠️ **IMPORTANT**: Always restore to a test database first!

**Option 1: Via Backup Management UI (Recommended)**

1. Navigate to `http://admin.localhost.com:3001/system/GlobalSettings?tab=backup`
2. Find the backup from before deletion occurred
3. Click "Restore" button
4. In the restore modal:
   - Verify source backup filename and database
   - **Change target database** to `affected_database_test` (use dropdown)
   - Check confirmation box
   - Click "⚠️ Restore Database"
5. Wait for completion

**Option 2: Via TypeScript Function**

```typescript
// Restore to test database
const restoreResult = await args.restoreFromBackup({
  filename: 'affected_database-20250110-020000-daily.dump.gz',
  sourceDatabaseName: 'affected_database',
  targetDatabaseName: 'affected_database_test',  // Test database!
  confirmed: true,
  sendEmail: args.sendEmail,
  subDomain: args.subDomain
});

console.log('Test restore result:', restoreResult);
```

### Step 5: Extract Deleted Data

```cypher
// Connect to test database
cypher-shell -u neo4j -p YourPassword123! -d affected_database_test

// Find the deleted data
MATCH (n:DeletedLabel)
WHERE n.id = 'deleted_item_id'
RETURN n;

// Export to file
CALL apoc.export.json.query(
  "MATCH (n:DeletedLabel) WHERE n.id = 'deleted_item_id' RETURN n",
  "deleted_data.json",
  {}
);
```

### Step 6: Import Data to Production

**Option A: Manual Import (Recommended for small datasets)**

```cypher
// Connect to production database
cypher-shell -u neo4j -p YourPassword123! -d affected_database

// Recreate deleted data
CREATE (n:DeletedLabel {
  id: 'deleted_item_id',
  name: 'value',
  // ... other properties
});

// Recreate relationships
MATCH (a:NodeA {id: 'id1'}), (b:NodeB {id: 'id2'})
CREATE (a)-[:DELETED_RELATIONSHIP]->(b);
```

**Option B: Automated Import (For larger datasets)**

```typescript
// Read exported data
const deletedData = JSON.parse(
  fs.readFileSync('/path/to/deleted_data.json', 'utf8')
);

// Import to production
for (const item of deletedData) {
  await session.run(`
    CREATE (n:DeletedLabel $props)
  `, { props: item });
}
```

### Step 7: Verify Data Recovery

```cypher
// Verify deleted data is restored
MATCH (n:DeletedLabel)
WHERE n.id = 'deleted_item_id'
RETURN n;

// Verify relationships
MATCH (n:DeletedLabel)-[r]->()
WHERE n.id = 'deleted_item_id'
RETURN type(r), count(r);
```

### Step 8: Clean Up Test Database

```cypher
// Switch to system database
:use system

// Drop test database
DROP DATABASE affected_database_test;
```

### Step 9: Implement Safeguards

To prevent future accidental deletions:

1. **Soft Deletes**: Implement soft delete pattern
   ```cypher
   // Instead of DELETE
   MATCH (n) WHERE n.id = 'id'
   SET n.deletedAt = datetime(), n.deletedBy = $userId
   ```

2. **Confirmation Dialogs**: Add confirmation for delete operations
3. **Audit Logs**: Log all delete operations
4. **Permissions**: Restrict delete permissions
5. **Backup Frequency**: Consider more frequent backups

---

## Using the Backup Management UI

### Overview

The Backup Management interface (`/system/GlobalSettings?tab=backup`) provides a comprehensive UI for all backup and restore operations. Use this interface for disaster recovery as it provides:

- Visual confirmation of each step
- Safety warnings and confirmation dialogs
- Progress indicators during restoration
- Real-time status of all databases
- Complete backup history with metadata

### Key Features for Disaster Recovery

#### 1. Backup Status Dashboard
- **Quick Health Check**: See backup system status at a glance
- **Last Successful/Failed**: Identify issues immediately
- **Manual Trigger**: Force immediate backup if needed

#### 2. Databases Table
- **Status Monitoring**: See which databases are online/offline
- **Quick Backup**: Create backup for any database with one click
- **Role Information**: Identify primary vs replica databases

#### 3. Cloud Backups Table
- **Complete History**: All backups with size and timestamp
- **Search/Filter**: Find specific backups quickly
- **Three Actions**:
  - **Download**: Get local copy for analysis
  - **Delete**: Remove old/unnecessary backups
  - **Restore**: Initiate recovery process

#### 4. Restore Modal Safety Features
- **Multiple Warnings**: Clear indication of data deletion
- **Target Selection**: Choose where to restore (same or different database)
- **Confirmation Required**: Must explicitly acknowledge risks
- **Progress Indicator**: Spinner shows restoration in progress
- **Modal Lock**: Cannot close during restoration (prevents interruption)
- **Automatic Steps**: All 6 restoration steps run automatically:
  1. Download backup from cloud
  2. Decompress backup file
  3. Stop database workers
  4. Drop and recreate database
  5. Restore all data
  6. Restart workers

### Best Practices with UI

**During Normal Operations:**
- Check backup status daily
- Monitor "Last Successful" timestamp
- Review failed backups immediately
- Test manual backup creation monthly

**During Disaster Recovery:**
- Use UI for visibility and confirmation
- Let progress indicators guide you
- Don't refresh page during restoration
- Wait for toast notifications confirming completion
- Use TypeScript functions only if UI is unavailable

**Safety Features:**
- Restore button disabled until confirmation checked
- Cancel button disabled during restoration
- Modal cannot be closed during active restoration
- All actions show clear success/error feedback

---

## Monthly Restoration Test Procedure

**Purpose**: Verify backups are valid and team knows recovery procedures

**Schedule**: First Monday of each month
**Duration**: 2-3 hours
**Team**: 2-3 people (primary + backup administrators)

### Test Procedure

#### Phase 1: Preparation (15 min)

- [ ] Schedule test during low-traffic period
- [ ] Notify team about test
- [ ] Document start time: `___________________________`
- [ ] Assign roles:
  - Test Lead: `___________________________`
  - Backup Operator: `___________________________`
  - Observer/Documenter: `___________________________`

#### Phase 2: Select Test Backup (5 min)

```bash
# List recent backups
aws s3 ls s3://your-backup-bucket/ --recursive | tail -n 20

# Select backup to test (use yesterday's backup)
```

Document selected backup:
- Filename: `___________________________`
- Timestamp: `___________________________`
- Size: `___________________________`

#### Phase 3: Restore to Test Environment (45-60 min)

```typescript
// Restore admin database to test
const adminRestore = await args.restoreFromBackup({
  filename: 'admin-YYYYMMDD-HHMMSS-daily.dump.gz',
  sourceDatabaseName: 'admin',
  targetDatabaseName: 'admin_restore_test',
  confirmed: true,
  sendEmail: args.sendEmail,
  subDomain: args.subDomain
});

console.log('Admin restore:', adminRestore);

// Restore one subdomain database
const subdomainRestore = await args.restoreFromBackup({
  filename: 'subdomain-YYYYMMDD-HHMMSS-daily.dump.gz',
  sourceDatabaseName: 'subdomain',
  targetDatabaseName: 'subdomain_restore_test',
  confirmed: true,
  sendEmail: args.sendEmail,
  subDomain: args.subDomain
});

console.log('Subdomain restore:', subdomainRestore);
```

Document restoration times:
- Admin restore time: `___________________________`
- Subdomain restore time: `___________________________`

#### Phase 4: Verify Data Integrity (30 min)

```cypher
// Connect to test databases
cypher-shell -u neo4j -p YourPassword123! -d admin_restore_test

// Verify node counts match expected
MATCH (n) RETURN count(n) as totalNodes;

// Verify critical data exists
MATCH (u:User) RETURN count(u) as users;
MATCH (s:SubDomain) RETURN count(s) as subdomains;
MATCH (p:Page) RETURN count(p) as pages;

// Check data quality
MATCH (n)
WHERE n.createdAt IS NULL OR n.id IS NULL
RETURN labels(n), count(n) as missingMetadata;
```

Document verification results:
- Total nodes: `___________________________`
- Users: `___________________________`
- Subdomains: `___________________________`
- Pages: `___________________________`
- Data quality issues: `___________________________`

#### Phase 5: Performance Testing (15 min)

```cypher
// Run performance queries
CALL apoc.warmup.run();

// Test typical queries
MATCH (u:User {email: 'test@example.com'})
RETURN u;

PROFILE MATCH (p:Page)-[:Attr*]->(a:Attr)
WHERE p.key = 'HomePage'
RETURN a
LIMIT 100;
```

Document query performance:
- Warmup time: `___________________________`
- Simple query time: `___________________________`
- Complex query time: `___________________________`

#### Phase 6: Cleanup (10 min)

```cypher
// Drop test databases
:use system
DROP DATABASE admin_restore_test;
DROP DATABASE subdomain_restore_test;
```

#### Phase 7: Documentation and Reporting (15 min)

Create test report:

```markdown
# Backup Restoration Test Report

**Test Date**: ___________________________
**Test Lead**: ___________________________
**Test Duration**: ___________________________

## Summary
- ✅ / ❌ Backup files accessible
- ✅ / ❌ Restoration completed successfully
- ✅ / ❌ Data integrity verified
- ✅ / ❌ Performance acceptable

## Metrics
- Total restoration time: ___________________________
- Admin database size: ___________________________
- Subdomain database size: ___________________________
- Data quality score: ___________________________

## Issues Found
1. ___________________________
2. ___________________________
3. ___________________________

## Action Items
1. ___________________________
2. ___________________________
3. ___________________________

## Recommendations
___________________________
___________________________
___________________________

## Next Test Date
___________________________
```

---

## Post-Recovery Checklist

After any recovery operation, complete this checklist:

### Immediate (Day 1)

- [ ] All services running normally
- [ ] Database connections stable
- [ ] Backup system operational
- [ ] No critical errors in logs
- [ ] Team notified of completion

### Short-term (Week 1)

- [ ] Monitor application performance
- [ ] Verify backup schedule running
- [ ] Check for any data inconsistencies
- [ ] User acceptance testing completed
- [ ] Incident report written

### Long-term (Month 1)

- [ ] Root cause analysis completed
- [ ] Prevention measures implemented
- [ ] Runbook updated with lessons learned
- [ ] Team training conducted
- [ ] Recovery procedures tested

---

## Escalation Procedures

### When to Escalate

Escalate immediately if:
- Recovery attempts fail after 2 tries
- Data corruption is spreading
- Backups are unavailable or corrupted
- Recovery time exceeds 4 hours
- Business critical data is at risk

### Escalation Path

**Level 1: Team Lead**
- Name: `___________________________`
- Phone: `___________________________`
- Email: `___________________________`

**Level 2: Technical Director**
- Name: `___________________________`
- Phone: `___________________________`
- Email: `___________________________`

**Level 3: External Support**
- Neo4j Support: support@neo4j.com
- Cloud Provider Support: [Account-specific]
- Database Consultant: `___________________________`

### External Support Contacts

**Neo4j Support**
- Enterprise Support Portal: https://support.neo4j.com/
- Phone: +1 (650) 555-XXXX (check your license)
- Email: support@neo4j.com

**AWS Support**
- Console: https://console.aws.amazon.com/support/
- Phone: 1-866-947-7382 (US)

**Google Cloud Support**
- Console: https://cloud.google.com/support
- Phone: 1-877-355-5787 (US)

---

## Appendix A: Common Error Messages

| Error Message | Likely Cause | Quick Fix |
|---------------|-------------|-----------|
| "Database not found" | Database deleted or wrong name | Check `SHOW DATABASES` |
| "Permission denied" | Credentials invalid | Re-authenticate cloud storage |
| "Connection timeout" | Network/firewall issue | Check connectivity, firewall rules |
| "Out of memory" | Database too large | Increase heap size, use streaming |
| "Backup file corrupted" | Download error or storage corruption | Try different backup |
| "Worker not found" | BullMQ worker not initialized | Restart application |

---

## Appendix B: Useful Commands Reference

### Neo4j Database Management

```cypher
// System database operations
:use system
SHOW DATABASES;
CREATE DATABASE newdb;
DROP DATABASE olddb;
START DATABASE mydb;
STOP DATABASE mydb;

// Check database status
SHOW DATABASE mydb;

// Check transaction logs
SHOW TRANSACTIONS;
```

### Cloud Storage

```bash
# AWS S3
aws s3 ls s3://bucket/                    # List objects
aws s3 cp s3://bucket/file.gz .           # Download
aws s3 cp file.gz s3://bucket/            # Upload
aws s3 rm s3://bucket/file.gz             # Delete

# Google Cloud Storage
gsutil ls gs://bucket/                     # List objects
gsutil cp gs://bucket/file.gz .            # Download
gsutil cp file.gz gs://bucket/             # Upload
gsutil rm gs://bucket/file.gz              # Delete
```

### System Monitoring

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top -n 1

# Check Neo4j memory
cat /var/lib/neo4j/data/databases/graph.db/debug.log | grep -i "memory"

# Check process status
ps aux | grep neo4j
ps aux | grep node
```

---

## Appendix C: Recovery Time Calculator

Use this to estimate recovery times:

| Factor | Small System | Medium System | Large System |
|--------|--------------|---------------|--------------|
| Database Size | < 1 GB | 1-10 GB | > 10 GB |
| Backup Download | 2-5 min | 5-15 min | 15-45 min |
| Database Restore | 5-10 min | 10-30 min | 30-120 min |
| Verification | 5 min | 10 min | 20 min |
| **Total RTO** | **15-20 min** | **30-60 min** | **1-3 hours** |

Add 50% buffer time for:
- First-time recovery
- Multiple database restoration
- Troubleshooting issues

---

## Document Maintenance

**Last Updated**: January 2025
**Version**: 1.0.0
**Next Review Date**: ___________________________

**Change Log**:
- 2025-01-11: Initial version created
- ___________________________
- ___________________________
