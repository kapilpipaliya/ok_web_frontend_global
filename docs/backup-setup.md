# Database Backup System Setup Guide

## Overview

The automated backup system protects your Neo4j databases by creating scheduled backups (hourly by default) and storing them securely in cloud storage (AWS S3 or Google Cloud Storage). This guide will walk you through the complete setup process.

## Features

- ✅ **Automated Hourly Backups** - Runs every hour by default (configurable via cron)
- ✅ **Multi-Database Support** - Backs up all active subdomains + admin database
- ✅ **Compression** - Reduces storage costs with gzip compression
- ✅ **Cloud Storage** - Secure storage in AWS S3 or Google Cloud Storage
- ✅ **Retention Policy** - Automatic cleanup of old backups
- ✅ **Email Alerts** - Get notified of backup success/failures
- ✅ **Dashboard Monitoring** - View backup status in Redis Management UI
- ✅ **Disaster Recovery** - Restore from any backup with one function call

---

## Prerequisites

Before setting up the backup system, you need:

1. **Neo4j Database** - Running and accessible
2. **Redis** - Running for BullMQ worker management
3. **Cloud Storage Account** - Either AWS S3 or Google Cloud Storage
4. **SMTP Configured** - For email alerts (optional but recommended)

---

## Part 1: Cloud Storage Setup

### Option A: AWS S3 Setup

#### 1. Create an S3 Bucket

```bash
# Using AWS CLI
aws s3api create-bucket \
  --bucket your-backup-bucket \
  --region us-east-1

# Enable versioning (recommended)
aws s3api put-bucket-versioning \
  --bucket your-backup-bucket \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket your-backup-bucket \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

#### 2. Create IAM User for Backups

1. Go to AWS IAM Console
2. Create new user: `backup-system`
3. Enable "Programmatic access"
4. Attach custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-backup-bucket",
        "arn:aws:s3:::your-backup-bucket/*"
      ]
    }
  ]
}
```

5. Save the **Access Key ID** and **Secret Access Key**

### Option B: Google Cloud Storage Setup

#### 1. Create a GCS Bucket

```bash
# Using gcloud CLI
gsutil mb -l us-east1 gs://your-backup-bucket

# Enable versioning
gsutil versioning set on gs://your-backup-bucket

# Enable encryption (default: Google-managed)
```

#### 2. Create Service Account

1. Go to Google Cloud Console → IAM & Admin → Service Accounts
2. Create service account: `backup-system`
3. Grant role: **Storage Object Admin**
4. Create and download JSON key file
5. Save the key file securely on your server

---

## Part 2: Environment Configuration

### 1. Copy .env.example to .env

```bash
cp .env.example .env
```

### 2. Configure Backup Settings

Edit `.env` and configure the backup section:

```bash
# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 * * * *  # Every hour at minute 0 UTC
BACKUP_STORAGE_TYPE=s3     # 's3' or 'gcs'

# === AWS S3 Configuration (if using S3) ===
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=your-backup-bucket
AWS_S3_REGION=us-east-1

# === OR Google Cloud Storage (if using GCS) ===
# GCS_PROJECT_ID=your-project-id
# GCS_BUCKET=your-backup-bucket
# GCS_KEYFILE_PATH=/path/to/service-account-key.json

# Backup Retention Policy
BACKUP_RETENTION_HOURLY=24  # Keep 24 hourly backups (last 24 hours)
BACKUP_RETENTION_DAILY=7    # Keep 7 daily backups (when using daily schedule)
BACKUP_RETENTION_WEEKLY=4   # Keep 4 weekly backups
BACKUP_RETENTION_MONTHLY=12 # Keep 12 monthly backups

# Backup Notifications
BACKUP_ALERT_EMAIL=admin@yourdomain.com
BACKUP_ALERT_ON_SUCCESS=false
BACKUP_ALERT_ON_FAILURE=true
```

### 3. Understand the Schedule Format

The `BACKUP_SCHEDULE` uses cron syntax:

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday = 0)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

Examples:
- `0 * * * *` - Every hour at minute 0 UTC (**default**)
- `0 2 * * *` - Daily at 2:00 AM UTC
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Weekly on Sunday at midnight
- `0 3 1 * *` - Monthly on 1st at 3:00 AM

When using the hourly schedule (`0 * * * *`), scheduled backups are tagged as `hourly` and retention uses `BACKUP_RETENTION_HOURLY`. For daily schedules, backups are tagged as `daily` and `BACKUP_RETENTION_DAILY` applies.

---

## Part 3: Install Required Dependencies

### 1. Install Node.js Packages

```bash
# AWS S3 (if using S3)
npm install aws-sdk

# Google Cloud Storage (if using GCS)
npm install @google-cloud/storage
```

### 2. Verify Neo4j APOC Installation (Optional but Recommended)

APOC provides efficient database export functionality.

```cypher
// Check if APOC is installed
RETURN apoc.version() as version;
```

If not installed, follow [APOC installation guide](https://neo4j.com/labs/apoc/installation/).

---

## Part 4: Deploy Backup Functions

### 1. Import Schema to Admin Database

The backup functions are defined in `/src/page_schema/admin/functions/`. They need to be imported to the admin database.

```bash
# Option 1: Via API endpoint (if running locally)
curl -X GET http://admin.localhost.com:3001/api/schema/import
```

### 2. Verify Functions are Imported

```cypher
// Connect to admin database
:use admin

// Check backup functions exist
MATCH (f:Function)
WHERE f.key STARTS WITH 'background' OR f.key CONTAINS 'backup'
RETURN f.key, f.description
ORDER BY f.key;
```

You should see:
- `backgroundBackupDatabase` - Main backup worker
- `createDatabaseBackup` - Creates individual database backups
- `applyBackupRetentionPolicy` - Cleans up old backups
- `sendBackupAlertEmail` - Sends email notifications
- `uploadBackupToCloud` - Uploads to S3/GCS
- `listCloudBackups` - Lists all backups
- `deleteCloudBackup` - Deletes a backup
- `downloadBackupFromCloud` - Downloads for restore

### 3. Start the Backup Worker

The backup worker starts automatically when the application starts. To verify:

```bash
# Check logs for backup worker initialization
npm run dev

# Look for these log messages:
# [Workers] Starting background database backup worker
# [Workers] Scheduled repeatable backup job
# [Workers] Database backup worker created successfully
```

---

## Part 5: Testing the Backup System

### 1. Trigger a Manual Backup

You can trigger a manual backup for testing:

**Option 1: Via Backup Management UI (Recommended)**
1. Navigate to `http://admin.localhost.com:3001/system/GlobalSettings?tab=backup`
2. Find the database in the "Databases / Subdomains" table
3. Click the "📦 Create Backup" button for the desired database
4. Wait for the success notification

**Option 2: Via Server Function**
```typescript
await executeNamedServerFunction({
  functionName: 'createDatabaseBackup',
  contextData: {
    databaseName: 'admin',
    backupType: 'manual'
  }
});
```

### 2. Verify Backup in Cloud Storage

**AWS S3:**
```bash
# List backups
aws s3 ls s3://your-backup-bucket/ --recursive

# Expected structure:
# admin/admin-20250111-140000-hourly.dump.gz
# ytorganizer/ytorganizer-20250111-140000-hourly.dump.gz
```

**Google Cloud Storage:**
```bash
# List backups
gsutil ls -r gs://your-backup-bucket/

# Expected structure:
# gs://your-backup-bucket/admin/admin-20250111-140000-hourly.dump.gz
# gs://your-backup-bucket/ytorganizer/ytorganizer-20250111-140000-hourly.dump.gz
```

### 3. Check Email Alerts

If configured, you should receive an email alert about the backup status.

### 4. View in Dashboard

Navigate to the Backup Management page to view and manage backups:

```
http://admin.localhost.com:3001/system/GlobalSettings?tab=backup
```

The dashboard shows:
- **Backup Status**: Enabled/disabled, schedule, last backup time
- **Databases/Subdomains Table**: All databases with status and create backup buttons
- **Cloud Backups Table**: All backups with download, delete, and restore options
- Statistics on completed and failed backups

---

## Part 6: Using the Backup Management UI

### Overview

The Backup Management interface provides a comprehensive dashboard for managing all backup operations at `/system/GlobalSettings?tab=backup`.

### Features

#### 1. Backup Status Section
- **System Status**: Shows if backup system is enabled/disabled
- **Last Successful Backup**: Displays time since last successful backup
- **Last Failed Backup**: Shows details of most recent failure (if any)
- **Statistics**: Total completed and failed backups
- **Configuration Info**: Current schedule (e.g. "Every hour (UTC)"), storage type (S3/GCS), retention summary
- **Manual Trigger**: Button to trigger immediate backup for all databases

#### 2. Databases / Subdomains Table
- **List View**: All databases in a clean, scannable table format
- **Database Name**: Monospace display of each database/subdomain
- **Status Badge**: Real-time online/offline status with color coding
- **Role**: Shows database role (primary, replica, etc.)
- **Create Backup**: Individual backup button for each database
  - Disabled for offline databases
  - Creates manual backup immediately
  - Shows success/error toast notification

#### 3. Cloud Backups Table
- **Comprehensive List**: All backups from cloud storage (S3 or GCS), with pagination for large lists
- **Metadata Display**:
  - Filename (with timestamp)
  - Source database name
  - File size (formatted in MB)
  - Creation date
- **Actions**:
  - **Download**: Download backup file locally
  - **Delete**: Remove backup from cloud storage (with confirmation)
  - **Restore**: Restore database from backup (see Restore Modal)

#### 4. Restore Modal
When clicking "Restore" on any backup, a comprehensive modal appears:

**Safety Features:**
- ⚠️ Multiple warning banners about data deletion
- Source backup and original database display
- Target database selector (all available databases)
- Required confirmation checkbox
- Disabled restore button until confirmed

**Restore Process:**
1. Select target database (defaults to original)
2. Read and understand the warnings
3. Check "I understand this will DELETE all data" checkbox
4. Click "⚠️ Restore Database" button
5. Wait for completion (worker will handle):
   - Download backup from cloud
   - Decompress backup file
   - Stop database workers
   - Drop and recreate target database
   - Restore all data
   - Restart workers
   - Send email notification

**Restoration Steps (Automated):**
- Step 1/6: Download backup from cloud storage
- Step 2/6: Decompress backup file
- Step 3/6: Stop workers for target database
- Step 4/6: Drop and recreate database
- Step 5/6: Restore data from backup
- Step 6/6: Restart workers

### UI Best Practices

**Creating Backups:**
- Only online databases can be backed up
- Manual backups are labeled as "manual" type
- Check backup status section for completion
- Verify backup appears in Cloud Backups table

**Deleting Backups:**
- Confirmation modal prevents accidental deletion
- Shows filename for verification
- Deletion is immediate and permanent
- No way to recover deleted backups

**Restoring Backups:**
- Always restore to a test database first
- Verify data integrity before production restore
- Consider downtime during restoration
- Workers are automatically stopped/restarted
- Email notification sent on completion/failure

### Keyboard Shortcuts

- **Refresh Page**: Use refresh button in header
- **ESC**: Close modals (confirmation, restore)
- **Tab Navigation**: Navigate through tables and buttons

---

## Part 7: Monitoring and Maintenance

### Monitor Backup Jobs

**Via Backup Management Dashboard:**
1. Navigate to `/system/GlobalSettings?tab=backup`
2. View backup system status:
   - Last successful backup time
   - Last failed backup (if any)
   - Total completed and failed backups
   - Backup schedule and storage configuration
3. Monitor all databases and their online/offline status
4. View all cloud backups with metadata (size, date, database)
5. Perform manual backup operations from the UI

**Via BullMQ:**
```bash
# Check backup queue status
redis-cli KEYS "*backgroundBackupDatabase*"

# View job details
redis-cli HGETALL "bull:backgroundBackupDatabase:jobs:{jobId}"
```

**Via Logs:**
```bash
# Watch backup logs
tail -f logs/application.log | grep Backup

# Look for:
# [Backup] Starting backup for database: admin
# [Backup] Backup complete: 15.2 MB
# [Backup] Upload complete
```

### Verify Backup Integrity

Periodically test backup integrity by restoring to a test database:

**Option 1: Via Backup Management UI (Recommended)**
1. Navigate to `http://admin.localhost.com:3001/system/GlobalSettings?tab=backup`
2. Find the backup in the "Cloud Backups" table
3. Click the "Restore" button
4. In the modal:
   - Review the source backup and original database
   - Select a target database (or leave empty to restore to original)
   - Check the confirmation checkbox
   - Click "⚠️ Restore Database"
5. Wait for the restoration to complete

**Option 2: Via TypeScript Function**
```typescript
await args.restoreFromBackup({
  filename: 'admin-20250111-140000-hourly.dump.gz',
  sourceDatabaseName: 'admin',
  targetDatabaseName: 'admin_test',  // Restore to test database
  confirmed: true,
  sendEmail: args.sendEmail,
  subDomain: args.subDomain
});
```

**⚠️ Warning:** Restoration will DELETE all existing data in the target database!

### Storage Cost Optimization

**Monitor Storage Usage:**
```bash
# AWS S3
aws s3 ls s3://your-backup-bucket --recursive --summarize

# GCS
gsutil du -sh gs://your-backup-bucket
```

**Adjust Retention Policy:**
If storage costs are high, reduce retention in `.env`:
```bash
BACKUP_RETENTION_HOURLY=12   # Reduced from 24 (keep 12 hours)
BACKUP_RETENTION_DAILY=5     # For daily schedule only
BACKUP_RETENTION_WEEKLY=3    # Reduced from 4
BACKUP_RETENTION_MONTHLY=6   # Reduced from 12
```

> **Note:** With hourly backups, storage usage grows faster. Monitor the Cloud Backups table and adjust `BACKUP_RETENTION_HOURLY` if needed.

---

## Troubleshooting

### Backup Worker Not Starting

**Symptom:** No backup jobs running

**Solutions:**
1. Check Redis is running: `redis-cli PING`
2. Verify `BACKUP_ENABLED=true` in `.env`
3. Check logs for worker initialization errors
4. Restart application: `npm run dev`

### Backup Failing to Upload

**Symptom:** Backup created locally but not in cloud

**Solutions:**
1. Verify cloud credentials in `.env`
2. Test credentials manually:
   ```bash
   # AWS S3
   aws s3 ls s3://your-backup-bucket

   # GCS
   gsutil ls gs://your-backup-bucket
   ```
3. Check IAM/service account permissions
4. Review error logs for specific error messages

### Large Backup Times

**Symptom:** Backups taking too long

**Solutions:**
1. Install APOC for faster exports
2. Increase worker resources (CPU/Memory)
3. Consider incremental backups (future feature)
4. Schedule during off-peak hours

### Email Alerts Not Sending

**Symptom:** No email notifications

**Solutions:**
1. Verify SMTP settings in `.env`
2. Check `BACKUP_ALERT_EMAIL` is set
3. Test email system: Run send-test-email script
4. Review email worker logs

---

## Best Practices

### 1. Test Restoration Regularly

**Monthly Restoration Test:**
- Restore latest backup to test database
- Verify data integrity
- Document restoration time
- Update disaster recovery procedures

### 2. Monitor Storage Costs

- Review monthly cloud storage bills
- Adjust retention policy as needed
- Consider lifecycle policies for older backups

### 3. Secure Backup Access

- Use IAM roles with minimum required permissions
- Rotate access keys regularly (every 90 days)
- Enable MFA for cloud storage console access
- Encrypt backups at rest (enabled by default)

### 4. Document Your Setup

- Keep `.env` backup configuration documented
- Document any custom retention policies
- Maintain list of backup admin contacts
- Document restoration procedures

### 5. Set Up Alerts

- Configure email alerts for backup failures
- Set up cloud storage usage alerts
- Monitor backup completion times
- Alert on missing scheduled backups

---

## Next Steps

- [ ] Review [Disaster Recovery Runbook](./disaster-recovery.md)
- [ ] Access Backup Management UI at `/system/GlobalSettings?tab=backup`
- [ ] Test manual backup creation for each database
- [ ] Test backup restoration to a test database
- [ ] Schedule monthly restoration test
- [ ] Configure cloud storage lifecycle policies
- [ ] Set up backup cost alerts
- [ ] Train team on using the Backup Management interface

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review application logs
3. Check Redis queue status
4. Contact system administrator

---

**Last Updated:** January 2025
**Version:** 1.0.0
