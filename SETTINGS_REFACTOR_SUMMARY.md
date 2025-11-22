# Settings Refactoring Summary

## Overview

Successfully refactored the settings system to use a unified `Setting` vertex with a `type` property instead of separate label-based vertices (OAuthSetting, EmailSetting, RazorpaySetting, StripeSetting).

## Changes Made

### 1. **Unified Server Functions**
Created common server-side functions for managing settings:
- **Location**: `src/lib/api/server/settings/settingsFunctions.ts`
- **Functions**:
  - `getSetting(dbSession, type, accountId?)` - Get settings by type
  - `saveSetting(dbSession, type, data, userEmail, accountId?)` - Save/update settings
  - `deleteSetting(dbSession, type, accountId?)` - Delete settings
- Supports both subdomain-specific and account-specific settings

### 2. **Common API Routes**
Created unified API endpoints:
- **GET** `/api/settings/get?type={type}` - Get settings by type
- **POST** `/api/settings/save` - Save settings with `{ type, data }` body

### 3. **Client-Side Functions**
Created common client functions with static imports:
- **Location**: `src/lib/api/client/settingsClient.ts`
  - `getSetting(type)` - Get settings from server
  - `saveSetting(type, data)` - Save settings to server
  - Uses static imports for better type safety and performance

- **Location**: `src/lib/api/client/isSettingEnabled.ts`
  - `isSettingEnabled(type, enabledField)` - Check if a setting is enabled
  - `isGoogleOAuthEnabled()` - Helper for OAuth
  - `isRazorpayEnabled()` - Helper for Razorpay
  - `isStripeEnabled()` - Helper for Stripe
  - Uses static imports following TypeScript best practices

### 4. **Updated Frontend Pages**
All settings pages now use the unified API:
- ✅ `src/pages/global/oauth/OAuthSetting.tsx` - Uses `getSetting("oauth")` and `saveSetting("oauth", data)`
- ✅ `src/pages/global/email/EmailSetting.tsx` - Uses `getSetting("email")` and `saveSetting("email", data)`
- ✅ `src/pages/global/razorpay/RazorpaySettings.tsx` - Uses `getSetting("razorpay")` and `saveSetting("razorpay", data)`
- ✅ `src/pages/global/stripe/StripeSettings.tsx` - Uses `getSetting("stripe")` and `saveSetting("stripe", data)`
- ✅ `src/pages/auth/SignInForm.tsx` - Updated to use `isGoogleOAuthEnabled()` from new location
- ✅ `src/pages/auth/SignupForm.tsx` - Updated to use `isGoogleOAuthEnabled()` from new location

### 5. **Migration Script**
Created migration utilities to convert existing data:
- **Location**: `src/cypher/migration/migrateSettingsToUnifiedFormat.ts`
  - `migrateSettingsToUnifiedFormat(dbSession)` - Adds `Setting` label and `type` property to existing settings
  - `rollbackSettingsMigration(dbSession)` - Rollback if needed
  - Keeps old labels for backward compatibility

- **Execution Script**: `scripts/migrateSettings.ts`
  - Run with: `npx tsx scripts/migrateSettings.ts [subdomain]`
  - Example: `npx tsx scripts/migrateSettings.ts admin`

## Database Schema

### New Unified Format

**Before:**
```cypher
(:OAuthSetting {googleClientId: "...", googleEnabled: true})
(:EmailSetting {active: "smtp", smtpHost: "..."})
(:RazorpaySetting {razorpayEnabled: true, razorpayKeyId: "..."})
(:StripeSetting {stripeEnabled: true, stripePublishableKey: "..."})
```

**After (clean migration - old labels removed):**
```cypher
(:Setting {type: "oauth", key: "oauth_Default", googleClientId: "...", googleEnabled: true})
(:Setting {type: "email", key: "email_Default", active: "smtp", smtpHost: "..."})
(:Setting {type: "razorpay", key: "razorpay_Default", razorpayEnabled: true, razorpayKeyId: "..."})
(:Setting {type: "stripe", key: "stripe_Default", stripeEnabled: true, stripePublishableKey: "..."})
```

**Relationships:**
- Subdomain settings: Standalone nodes with `Setting` label
- Account-specific settings: `(Account)-[:AccountSetting]->(Setting)`

## Benefits

1. **Unified API**: Single set of functions for all setting types
2. **Extensible**: Easy to add new setting types without creating new functions
3. **Consistent**: All settings follow the same pattern
4. **Backward Compatible**: Old labels retained, queries updated to use `type` property
5. **Type-Safe**: TypeScript types for all setting operations
6. **Cleaner Codebase**: Removed duplicate code across setting types

## Migration Steps

To migrate existing data:

1. **Backup your database** (important!)
2. Run the migration script:
   ```bash
   npx tsx scripts/migrateSettings.ts admin
   ```
3. Verify the migration by checking the Neo4j database
4. Test all settings pages to ensure they work correctly

## Deprecated Files (Deleted)

These files have been removed as they are no longer needed:
- ✅ **Deleted**: `src/pages/global/oauth/oauthServerFunctions.ts`
- ✅ **Deleted**: `src/pages/global/razorpay/razorpayServerFunction.ts`
- ✅ **Deleted**: `src/pages/global/stripe/stripeServerFunctions.ts`
- ✅ **Deleted**: `src/routes/api/settings/email/` (entire directory)
- ✅ **Deleted**: `src/cypher/mutate/email/getAccountEmailSettings.ts`
- ✅ **Deleted**: `src/cypher/mutate/email/createOrUpdateAccountEmailSetting.ts`

## Usage Examples

### Getting Settings
```typescript
import { getSetting } from "~/lib/api/client/settingsClient";

const response = await getSetting("oauth");
const oauthSettings = response.result?.[0];
console.log(oauthSettings.P.googleEnabled);
```

### Saving Settings
```typescript
import { saveSetting } from "~/lib/api/client/settingsClient";

const response = await saveSetting("oauth", {
  googleEnabled: true,
  googleClientId: "your-client-id",
  googleClientSecret: "your-secret"
});
```

### Checking if Setting is Enabled
```typescript
import { isGoogleOAuthEnabled } from "~/lib/api/client/isSettingEnabled";

const response = await isGoogleOAuthEnabled();
if (response.result) {
  // OAuth is enabled
}
```

### Adding a New Setting Type

1. Create a settings page (copy existing pattern)
2. Use `getSetting("newtype")` and `saveSetting("newtype", data)`
3. No backend changes needed!

## Testing

All settings pages should be tested:
1. Navigate to `/admin/GlobalSettings`
2. Test OAuth settings
3. Test Email settings
4. Test Razorpay settings
5. Test Stripe settings
6. Verify settings are saved correctly
7. Verify settings are loaded correctly
8. Test account-specific settings (if applicable)

## Notes

- **Old labels are REMOVED** - The migration script removes old labels (OAuthSetting, EmailSetting, etc.) and keeps only the `Setting` label
- New queries use `MATCH (s:Setting {type: $type})` instead of `MATCH (s:OAuthSetting)`
- Account-specific email settings use `AccountSetting` relationship instead of `AccountEmailSetting`
- All encryption/decryption logic can be added to the unified functions as needed
- **All imports use static imports at the top** - following TypeScript best practices for better type checking and performance
- **Deprecated functions deleted** - All old setting-specific server functions have been removed
- **Updated initialSeed** - The YSaar initial seed function now creates settings in the unified format

## Architecture Follows

This refactoring follows the guidelines in `src/routes/api/chat/SYSTEM_PROMPT.md` for creating unified, maintainable systems.
