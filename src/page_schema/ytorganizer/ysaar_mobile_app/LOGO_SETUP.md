# YSaar Mobile App - Adding Logo Documentation

This document explains how to add a custom logo/icon to the Capacitor mobile app.

## Prerequisites

- Node.js and npm installed
- Capacitor project initialized
- A logo image file (PNG format recommended, square dimensions ideal)
- Logo should be at least 1024x1024px for best quality

---

## Adding the Logo

### Step 1: Install Capacitor Assets Tool

The `@capacitor/assets` tool automatically generates all required icon sizes and formats for different screen densities.

```bash
npm install -D @capacitor/assets
```

This installs the tool as a dev dependency.

### Step 2: Prepare Your Logo

1. Place your logo file in the project root (e.g., `smalllogo.png`)
2. Create a `resources` directory:

```bash
mkdir -p resources
```

3. Copy your logo as `icon.png` (this is the standard name the tool expects):

```bash
cp smalllogo.png resources/icon.png
```

**Note:** The logo should ideally be:
- Square dimensions (1:1 aspect ratio)
- At least 1024x1024px
- PNG format with transparency if needed

### Step 3: Generate All Icon Assets

Run the Capacitor assets generator to create all required icons:

```bash
npx @capacitor/assets generate --iconBackgroundColor '#ffffff' --android
```

**Command Breakdown:**
- `@capacitor/assets generate` - Runs the asset generation tool
- `--iconBackgroundColor '#ffffff'` - Sets white background for adaptive icons
- `--android` - Generate Android-specific assets only (add `--ios` for iOS)

**What Gets Generated:**

The tool automatically creates **74 assets** in total:

1. **App Icons** (all screen densities):
   - `mipmap-ldpi/ic_launcher.png` (36x36)
   - `mipmap-mdpi/ic_launcher.png` (48x48)
   - `mipmap-hdpi/ic_launcher.png` (72x72)
   - `mipmap-xhdpi/ic_launcher.png` (96x96)
   - `mipmap-xxhdpi/ic_launcher.png` (144x144)
   - `mipmap-xxxhdpi/ic_launcher.png` (192x192)

2. **Adaptive Icons** (Android 8.0+):
   - Foreground layers (transparent PNG with logo)
   - Background layers (solid color or pattern)
   - XML configuration files in `mipmap-anydpi-v26/`

3. **Round Icons** (for devices that support round icons):
   - Similar sizes as regular icons but with rounded mask

4. **Splash Screens**:
   - Portrait orientations (all densities)
   - Landscape orientations (all densities)
   - Dark mode variants for both orientations

**Output Example:**
```
Generating assets for android
CREATE android adaptive-icon .../mipmap-ldpi/ic_launcher_foreground.png (5.41 KB)
CREATE android adaptive-icon .../mipmap-mdpi/ic_launcher_foreground.png (7.83 KB)
...
CREATE android icon .../mipmap-mdpi/ic_launcher.png (1.78 KB)
CREATE android splash .../drawable/splash.png (6.09 KB)
...

Totals:
android: 74 generated, 955.49 KB total
```

### Step 4: Sync Changes to Android Project

After generating the assets, sync them to your Capacitor Android project:

```bash
npx cap sync android
```

This command:
- Copies web assets from `dist/` to Android project
- Updates Android plugins
- Applies the new icon assets

**Expected Output:**
```
✔ Copying web assets from dist to android/app/src/main/assets/public
✔ Creating capacitor.config.json in android/app/src/main/assets
✔ copy android
✔ Updating Android plugins
[info] Found 2 Capacitor plugins for android:
       @capacitor/camera@7.0.2
       @capacitor/splash-screen@7.0.3
✔ update android
✔ Sync finished in 0.027s
```

### Step 5: Verify Installation

Check that the icons were created correctly:

```bash
ls -lh android/app/src/main/res/mipmap-mdpi/ | grep ic_launcher
```

**Expected Output:**
```
-rw-r--r--  1.8K ic_launcher.png
-rw-r--r--  350B ic_launcher_background.png
-rw-r--r--  7.8K ic_launcher_foreground.png
-rw-r--r--  2.5K ic_launcher_round.png
```

---

## Troubleshooting

### Problem: "Could not find the web assets directory"

**Solution:**
1. Ensure `webDir` in `capacitor.config.json` matches your build output directory
2. Build your app first: `npm run build`
3. Verify the directory exists: `ls dist/index.html`

### Problem: Icons Not Appearing on Device

**Solution:**
1. Clean and rebuild the Android project:
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

2. Uninstall the app from device/emulator and reinstall:
```bash
npx cap run android
```

### Problem: Want to Change Icon Background Color

**Solution:**
Re-run the generate command with a different color:

```bash
npx @capacitor/assets generate --iconBackgroundColor '#ff0000' --android
npx cap sync android
```

### Problem: Icon Appears Pixelated

**Solution:**
Use a higher resolution source image (minimum 1024x1024px recommended):

1. Replace `resources/icon.png` with higher resolution version
2. Re-generate assets:
```bash
npx @capacitor/assets generate --iconBackgroundColor '#ffffff' --android
npx cap sync android
```

---

## File Structure

After setup, your project structure includes:

```
ysaar_mobile_app/
├── resources/
│   └── icon.png                    # Source logo file (1024x1024 recommended)
├── smalllogo.png                   # Original logo file
├── capacitor.config.json           # Capacitor configuration
├── android/
│   └── app/
│       └── src/
│           └── main/
│               └── res/
│                   ├── mipmap-ldpi/          # Icons for low density screens
│                   ├── mipmap-mdpi/          # Icons for medium density screens
│                   ├── mipmap-hdpi/          # Icons for high density screens
│                   ├── mipmap-xhdpi/         # Icons for extra-high density screens
│                   ├── mipmap-xxhdpi/        # Icons for extra-extra-high density
│                   ├── mipmap-xxxhdpi/       # Icons for extra-extra-extra-high density
│                   ├── mipmap-anydpi-v26/    # Adaptive icon XML configs
│                   ├── drawable/             # Default splash screen
│                   ├── drawable-land-*/      # Landscape splash screens
│                   ├── drawable-port-*/      # Portrait splash screens
│                   ├── drawable-night/       # Dark mode splash (default)
│                   ├── drawable-land-night-*/ # Dark mode landscape splash
│                   └── drawable-port-night-*/ # Dark mode portrait splash
└── package.json
```

---

## Understanding Android Icon Types

### 1. Regular Icons (`ic_launcher.png`)
Traditional app icons displayed on older Android versions (pre-8.0).

### 2. Adaptive Icons (Android 8.0+)
Modern icons with two layers:
- **Foreground:** Your logo (transparent background)
- **Background:** Solid color or pattern

This allows the system to:
- Apply different shapes (circle, square, rounded square, squircle)
- Create animations
- Apply consistent styling across the system

### 3. Round Icons (`ic_launcher_round.png`)
Special variant for launchers that support circular icons.

### 4. Splash Screens
Displayed when app launches:
- **Portrait/Landscape:** For different device orientations
- **Multiple densities:** For different screen resolutions
- **Dark mode variants:** Match system theme

---

## Updating the Logo in the Future

To update your app logo:

1. Replace the source image:
```bash
cp new-logo.png resources/icon.png
```

2. Regenerate all assets:
```bash
npx @capacitor/assets generate --iconBackgroundColor '#ffffff' --android
```

3. Sync to Android:
```bash
npx cap sync android
```

4. Clean and rebuild (if needed):
```bash
cd android && ./gradlew clean && cd ..
npx cap run android
```

---

## Adding iOS Icons

When ready to add iOS support, follow the same process but include iOS in the command:

```bash
# For both platforms
npx @capacitor/assets generate --iconBackgroundColor '#ffffff' --android --ios

# Or iOS only
npx @capacitor/assets generate --iconBackgroundColor '#ffffff' --ios

# Then sync
npx cap sync ios
```

---

## Additional Resources

- [Capacitor Assets Documentation](https://github.com/ionic-team/capacitor-assets)
- [Capacitor Official Docs](https://capacitorjs.com/docs)
- [Android Icon Guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [Adaptive Icons Explained](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)

---

## Summary of Commands

```bash
# Fix JSON config (manual edit)
# Edit capacitor.config.json - remove trailing commas

# Install assets tool
npm install -D @capacitor/assets

# Prepare logo
mkdir -p resources
cp smalllogo.png resources/icon.png

# Generate all assets
npx @capacitor/assets generate --iconBackgroundColor '#ffffff' --android

# Sync to Android
npx cap sync android

# Verify
ls -lh android/app/src/main/res/mipmap-mdpi/

# Run on device (optional)
npx cap run android
```

---

**Date Created:** November 18, 2025
**App:** YSaar Mobile App (com.ysaar.app)
