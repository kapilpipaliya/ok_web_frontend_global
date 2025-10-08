# Google Play Store Publishing Checklist

## Pre-Release Preparation

### 1. App Signing
- [ ] Generate a signed release APK/AAB
- [ ] Keep keystore file safe (NEVER lose this!)
- [ ] Store keystore password securely

### 2. App Details
- [ ] App name: "Chaitanya Alert"
- [ ] Short description (80 characters max)
- [ ] Full description (4000 characters max)
- [ ] Category: Tools or Communication
- [ ] Content rating: Fill questionnaire

### 3. Graphics Assets Required
- [ ] App icon: 512x512px PNG (high-res)
- [ ] Feature graphic: 1024x500px (for store listing)
- [ ] Phone screenshots: At least 2 (up to 8)
  - Recommended: 1080x1920px or similar
- [ ] 7-inch tablet screenshots (optional)
- [ ] 10-inch tablet screenshots (optional)

### 4. Privacy Policy
- [ ] Create privacy policy (REQUIRED for apps with notifications)
- [ ] Host it online (free options: GitHub Pages, Google Sites)
- [ ] Include: What data collected, how it's used, storage details

### 5. App Information
- [ ] App package name: com.ChaitanyaAlert.ChaitanyaAlert
- [ ] Default language: English
- [ ] Translations (optional)
- [ ] Contact email
- [ ] Phone number (optional)

## Build Release Version

### Step 1: Update Version
Edit `app/build.gradle.kts`:
```kotlin
defaultConfig {
    versionCode = 1  // Increment for each release
    versionName = "1.0.0"  // User-visible version
}
```

### Step 2: Create Signed Bundle/APK
1. In Android Studio: Build → Generate Signed Bundle/APK
2. Choose: Android App Bundle (recommended)
3. Create new keystore or use existing
4. Fill keystore details:
   - Keystore path: Choose secure location
   - Password: Strong password
   - Alias: "chaitanya-alert-key"
   - Validity: 25+ years
   - Certificate info: Your details

### Step 3: Build Configuration
Add to `app/build.gradle.kts`:
```kotlin
buildTypes {
    release {
        isMinifyEnabled = true  // Enable ProGuard
        proguardFiles(
            getDefaultProguardFile("proguard-android-optimize.txt"),
            "proguard-rules.pro"
        )
    }
}
```

## Privacy Policy Template

```
Privacy Policy for Chaitanya Alert

Last updated: [Date]

This app collects the following information:
1. Messaging app notification content (sender name and message)
2. Notification timestamps

Data Storage:
- All data is stored locally on your device
- No data is transmitted to external servers
- Data can be deleted anytime through the app

Permissions Used:
- Notification Access: To read messaging app notifications
- Post Notifications: To show alerts (Android 13+)

Contact: [Your email]
```

## Google Play Console Steps

### 1. Create App
- Click "Create app"
- Enter app details
- Select "App" (not Game)
- Select "Free" (or Paid)
- Accept policies

### 2. Store Listing
- Upload all graphics
- Write descriptions
- Add privacy policy URL
- Select category
- Add tags

### 3. App Content
- Complete content rating questionnaire
- Set target audience
- Declare app functionality
- Add privacy policy

### 4. Release Management
- Go to "Production" → "Create new release"
- Upload signed AAB file
- Write release notes
- Review and rollout

### 5. Pricing & Distribution
- Select countries
- Confirm free/paid
- Accept terms

### 6. App Review
- Review time: 2-3 hours to few days
- Fix any issues if rejected
- Resubmit if needed

## Important Notes

1. **Keystore Security**:
   - BACKUP your keystore file
   - NEVER lose keystore password
   - Same keystore needed for all updates

2. **Testing**:
   - Test release build thoroughly
   - Use internal testing track first
   - Get feedback before production

3. **Updates**:
   - Always increment versionCode
   - Test updates before release
   - Write clear release notes

4. **Policies**:
   - Follow Google Play policies
   - Declare all permissions usage
   - Be transparent about data collection

## Post-Launch

1. Monitor crash reports
2. Respond to user reviews
3. Regular updates
4. Track analytics
5. Optimize store listing based on performance

## Useful Links
- Play Console: https://play.google.com/console
- Asset Generator: https://romannurik.github.io/AndroidAssetStudio/
- Policy Generator: https://app-privacy-policy-generator.firebaseapp.com/
- Play Console Help: https://support.google.com/googleplay/android-developer/