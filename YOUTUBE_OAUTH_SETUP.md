# YouTube OAuth Setup Guide

This guide walks you through setting up per-user YouTube OAuth authentication for YouTube Organizer.

## Overview

We've implemented **per-user YouTube OAuth** which means:
- Each user connects their own YouTube account
- Each user gets their own 10,000 units/day API quota
- Users can access their private playlists, subscriptions, and liked videos
- Better security with encrypted token storage
- Full compliance with Google/YouTube API policies

---

## Step 1: Generate Encryption Key

Generate a secure encryption key for storing OAuth tokens:

```bash
# Generate 32-byte encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (64 hex characters) and add to `.env`:

```bash
# Add to .env file
TOKEN_ENCRYPTION_KEY=your_generated_64_character_hex_key_here
```

**⚠️ CRITICAL:** Never commit this key to git! Ensure `.env` is in your `.gitignore`.

---

## Step 2: Configure Google Cloud Console

### 2.1 Enable YouTube Data API v3

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **"APIs & Services"** → **"Library"**
4. Search for **"YouTube Data API v3"**
5. Click **"Enable"**

### 2.2 Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (for public apps) or **"Internal"** (for G Suite only)
3. Fill in application information:
   - **App name:** YouTube Organizer (or your app name)
   - **User support email:** Your email
   - **App logo:** Upload your logo (optional)
   - **App domain:**
     - Homepage: `https://yourdomain.com`
     - Privacy policy: `https://yourdomain.com/privacy`
     - Terms of service: `https://yourdomain.com/terms` (create if needed)
   - **Developer contact:** Your email
4. Click **"Save and Continue"**

### 2.3 Add YouTube Scopes

1. Click **"Add or Remove Scopes"**
2. Add the following scope:
   ```
   https://www.googleapis.com/auth/youtube.readonly
   ```
3. Click **"Update"** then **"Save and Continue"**

### 2.4 Add Test Users (Development Only)

If your app is in "Testing" mode:
1. Add test user emails (including your own)
2. These users can authorize your app before publishing

### 2.5 Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `YouTube Organizer OAuth Client`
5. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://yourdomain.com
   ```
6. **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/youtube/callback
   https://yourdomain.com/api/auth/youtube/callback
   ```
7. Click **"Create"**
8. **Download the JSON file** (you'll need this)

---

## Step 3: Configure Application

### 3.1 Update Environment Variables

Add to your `.env` file:

```bash
# Token Encryption (generated in Step 1)
TOKEN_ENCRYPTION_KEY=your_64_character_hex_key_here

# Keep your existing variables
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
```

### 3.2 Import OAuth Credentials to Database

1. Start your app: `npm run dev`
2. Log in as admin
3. Go to **Admin Panel** → **Global Settings** → **OAuth Settings**
4. Click **"Import Google Client Secret JSON"**
5. Upload the JSON file you downloaded from Google Cloud Console
6. Click **"Save Changes"**

Alternatively, manually copy from the JSON file:
- **Google Client ID:** `xxxxxx.apps.googleusercontent.com`
- **Google Client Secret:** `GOCSPX-xxxxxxxxxxxxx`

---

## Step 4: Update Neo4j Database Schema

The system will automatically create the necessary relationships, but here's the schema for reference:

```cypher
// YouTube OAuth Token Storage
(:User)-[:UserYouTubeToken]->(:YouTubeToken {
  accessTokenEncrypted: "encrypted_token",
  refreshTokenEncrypted: "encrypted_refresh_token",
  expiresAt: datetime,
  scope: "https://www.googleapis.com/auth/youtube.readonly",
  issuedAt: datetime,
  lastRefreshed: datetime,
  isRevoked: false
})
```

---

## Step 5: Test the OAuth Flow

### 5.1 Connect YouTube Account

1. Log in to your app
2. Go to **Settings** → **YouTube Connection** (or navigate to `/settings/youtube`)
3. Click **"Connect YouTube Account"**
4. You'll be redirected to Google
5. Sign in and authorize the app
6. You'll be redirected back to your app with success message

### 5.2 Test Adding a Channel

1. Navigate to YouTube Organizer section
2. Click **"Add Channel"**
3. Enter a YouTube channel URL
4. Channel should be added successfully using your OAuth token!

### 5.3 Check Token Status

1. Go to **Settings** → **YouTube Connection**
2. You should see:
   - **Status:** Connected
   - **Last synced:** Recent date
   - **Access:** Read-only

---

## Step 6: Update Existing Functions

The following functions have been updated to use per-user OAuth:

- ✅ `saveChannel` - Now uses user's OAuth token
- ⚠️ `savePlaylist` - Needs update (similar to saveChannel)
- ⚠️ Background workers - Need update to use user's OAuth token

### Update savePlaylist Function

Apply the same pattern as `saveChannel`:

```javascript
// Replace API key fetch with:
const { getYouTubeClient } = await import('~/lib/youtube/youtubeOAuth');
const youtube = await getYouTubeClient(user.P.uuid, args.session);

// Use youtube client as before
const playlistResponse = await youtube.playlists.list({...});
```

---

## Step 7: Testing Checklist

- [ ] Encryption key generated and added to `.env`
- [ ] Google Cloud Console configured
- [ ] OAuth credentials imported to database
- [ ] Can connect YouTube account successfully
- [ ] Can disconnect YouTube account
- [ ] Can add channels using OAuth
- [ ] Can add playlists using OAuth
- [ ] Token refresh works (test after 1 hour)
- [ ] Revocation detection works (revoke in Google, then try to add channel)

---

## Common Issues & Solutions

### Issue: "No YouTube authorization found"

**Solution:** User needs to connect their YouTube account first.
- Go to Settings → YouTube Connection
- Click "Connect YouTube Account"

### Issue: "Invalid redirect URI"

**Solution:** Check redirect URI in Google Cloud Console matches exactly:
- Development: `http://localhost:3000/api/auth/youtube/callback`
- Production: `https://yourdomain.com/api/auth/youtube/callback`

### Issue: "Token has been expired or revoked"

**Solution:** User needs to reconnect their YouTube account.
- The app automatically detects this
- Show user a message to reconnect in settings

### Issue: "Quota exceeded"

**Solution:** This is now per-user (10k units/day per user), much better than before!
- Each user has their own quota
- Tell user to try again tomorrow
- Or upgrade to higher quota with Google

---

## Security Best Practices

✅ **DO:**
- Keep `TOKEN_ENCRYPTION_KEY` secret
- Store tokens encrypted in database
- Use HTTPS in production
- Implement CSRF protection
- Log security events

❌ **DON'T:**
- Commit encryption keys to git
- Store tokens in plain text
- Expose tokens in client-side code
- Share OAuth credentials publicly

---

## Production Deployment

Before going live:

1. **Update URLs** in `.env`:
   ```bash
   ```

2. **Update Google Cloud Console:**
   - Add production domain to authorized origins
   - Add production callback URL to authorized redirects

3. **Publish OAuth App:**
   - Go to OAuth consent screen
   - Click "Publish App"
   - Submit for verification (may take time)

4. **Update Privacy Policy:**
   - Ensure it reflects OAuth usage
   - Include links to Google/YouTube policies
   - Add revocation instructions

5. **Monitor:**
   - Set up error logging
   - Monitor OAuth failures
   - Track token refresh rates
   - Watch for quota issues

---

## Next Steps

1. ✅ Encryption setup complete
2. ✅ OAuth routes created
3. ✅ Token management implemented
4. ✅ saveChannel updated
5. ⏳ Update `savePlaylist` function (similar to saveChannel)
6. ⏳ Create YouTube connection settings UI
7. ⏳ Update background workers to use per-user OAuth
8. ⏳ Update privacy policy
9. ⏳ Test end-to-end flow
10. ⏳ Deploy to production

---

## Support & Resources

- [YouTube API Documentation](https://developers.google.com/youtube/v3/docs)
- [OAuth 2.0 Overview](https://developers.google.com/identity/protocols/oauth2)
- [YouTube API Policies](https://developers.google.com/youtube/terms/developer-policies)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## Questions?

If you encounter issues:
1. Check the logs for detailed error messages
2. Verify encryption key is set correctly
3. Confirm OAuth credentials are correct
4. Test with your own account first
5. Check Google Cloud Console for error logs
