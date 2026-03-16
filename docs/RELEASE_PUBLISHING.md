# Release Publishing Guide

This documentation explains the step-by-step process for publishing new Autrex releases.

## 📋 Pre-Release Preparation

### 1. Determine Version Number

We use Semantic Versioning (SemVer): `MAJOR.MINOR.PATCH`

- **MAJOR** (1.x.x): Breaking changes
- **MINOR** (x.1.x): New features (backward compatible)
- **PATCH** (x.x.1): Bug fixes

**Examples:**
- Adding new feature: `1.1.2` → `1.2.0`
- Fixing bugs: `1.1.2` → `1.1.3`
- Major changes: `1.1.2` → `2.0.0`

### 2. Document Changes

Update `changes.md` file:

```markdown
# v1.x.x

## 🎉 New Features
- Feature 1
- Feature 2

## 🔧 Improvements
- Improvement 1
- Improvement 2

## 🐛 Bug Fixes
- Fix 1
- Fix 2

## 📝 Notes
Important notes here
```

## 🔨 Build Process

### Step 1: Update Version Number

Change version in `package.json`:

```json
{
  "version": "1.2.0"
}
```

### Step 2: Build

```bash
npm run build:win
```

**Generated Files:**
- `dist/Autrex-{version}-setup.exe` - Windows installer
- `dist/latest.yml` - Required for auto-update

### Step 3: Verify Build

```bash
ls -lh dist/Autrex-*-setup.exe dist/latest.yml
```

Check `latest.yml` content:
```bash
cat dist/latest.yml
```

Should show correct version number and reasonable file size.

## 📤 Publishing to GitHub

### Method 1: Manual Release (Recommended)

1. **Go to GitHub Releases Page:**
   ```
   https://github.com/Spryzenweb/Autrex/releases/new
   ```

2. **Fill Release Information:**
   - **Tag:** `v1.x.x` (e.g., `v1.2.0`)
   - **Release title:** `v1.x.x - Short Description`
   - **Description:** Copy content from `changes.md`

3. **Upload Files:**
   - `dist/Autrex-{version}-setup.exe`
   - `dist/latest.yml`
   
   ⚠️ **IMPORTANT:** You must upload BOTH files!

4. **Click "Publish release" Button**

### Method 2: GitHub Actions (Automatic)

⚠️ **Currently not working** - Git remote configuration needed

For future use:

```bash
# Add git remote (once)
git remote add origin https://github.com/Spryzenweb/Autrex.git

# For each release
git add .
git commit -m "v1.x.x: Description"
git tag v1.x.x
git push origin main
git push origin v1.x.x
```

GitHub Actions will automatically build and create release.

## ✅ Post-Release Checks

### 1. Verify Release Page

https://github.com/Spryzenweb/Autrex/releases/latest

**Checklist:**
- ✅ Correct version number
- ✅ `Autrex-{version}-setup.exe` file exists
- ✅ `latest.yml` file exists
- ✅ Changelog looks correct

### 2. Validate latest.yml Content

Open `latest.yml` file on GitHub and verify:
- Is version number correct?
- Does filename match the `.exe` file?
- Is SHA512 hash present?

### 3. Test Auto-Update

**Test Scenario:**
1. Install old version (e.g., v1.1.2)
2. Publish new release on GitHub (e.g., v1.1.3)
3. Open the app
4. Wait 3 seconds
5. Update modal should appear
6. Click "Update Now" button
7. Download progress bar should show
8. After download, app should auto-restart with new version

## ⚠️ Important Considerations

### Critical Rules

1. **Never Forget latest.yml File**
   - Auto-update WILL NOT WORK without this file
   - Always upload it with every release

2. **Version Number Consistency**
   - `package.json` version
   - Git tag (`v1.x.x`)
   - Release title
   - All must match!

3. **Mandatory Update System**
   - Since v1.1.3, updates are MANDATORY
   - Users cannot use old versions
   - NO "Later" button

4. **Always Test**
   - Test before every release
   - Try updating from old to new version

### Common Mistakes

❌ **Forgetting to upload latest.yml**
- Result: Auto-update doesn't work

❌ **Wrong version number**
- Result: Update not detected

❌ **Forgetting to push tag**
- Result: GitHub Actions doesn't run (automatic method)

❌ **Not updating changes.md**
- Result: Users don't know what changed

## 🔄 Update Flow

```
Code Changes
    ↓
Update package.json version
    ↓
Update changes.md
    ↓
npm run build:win
    ↓
Verify files in dist/
    ↓
Create GitHub Release
    ↓
Upload Autrex-{version}-setup.exe
    ↓
Upload latest.yml
    ↓
Publish release
    ↓
Test (update from old version)
```

## 🧪 Testing Process

### Development Environment Test

In `src/main/services/updaterService.ts`:

```typescript
// Enable for testing
autoUpdater.forceDevUpdateConfig = true

// Disable for production
// autoUpdater.forceDevUpdateConfig = true
```

Then:
```bash
npm run dev
```

### Production Test

1. Install old version (e.g., v1.1.2)
2. Publish new release on GitHub (e.g., v1.1.3)
3. Open the app
4. Wait for update modal
5. Download and install update

## 📊 How Update System Works

### Check Mechanism

1. **On App Startup:**
   - Auto-check after 3 seconds
   - Request to `https://github.com/Spryzenweb/Autrex/releases/latest`

2. **latest.yml Downloaded:**
   ```yaml
   version: 1.2.0
   files:
     - url: Autrex-1.2.0-setup.exe
       sha512: [hash]
       size: 102802969
   ```

3. **Version Comparison:**
   - GitHub version: `1.2.0`
   - Current version: `1.1.2`
   - `1.2.0 > 1.1.2` → Update available!

4. **Modal Displayed:**
   - Mandatory update screen appears
   - User cannot close it
   - Only "Update Now" button available

5. **Download:**
   - `.exe` file downloads
   - Progress bar shown
   - SHA512 hash verified

6. **Installation:**
   - Auto-install after download
   - App quits
   - New version installs
   - App reopens

## 🚨 Emergency Procedures

### If Faulty Release Published

1. **Immediately Publish New Patch Release:**
   ```bash
   # Increment version (e.g., 1.2.0 → 1.2.1)
   # Fix the bug
   npm run build:win
   # Create new GitHub release
   ```

2. **Delete Old Release (Optional):**
   - Set old release to draft on GitHub
   - Or delete completely

### If Update System Not Working

**Checklist:**
1. ✅ Is `latest.yml` file in GitHub release?
2. ✅ Is version number correct?
3. ✅ Does `.exe` filename match `latest.yml`?
4. ✅ Is repo info correct in `electron-builder.yml`?
   ```yaml
   publish:
     provider: github
     owner: Spryzenweb
     repo: Autrex
   ```
5. ✅ Is repo info correct in `updaterService.ts`?
   ```typescript
   autoUpdater.setFeedURL({
     provider: 'github',
     owner: 'Spryzenweb',
     repo: 'Autrex'
   })
   ```

## 📝 Checklist: Before Each Release

Check this list before publishing:

- [ ] `package.json` version updated
- [ ] `changes.md` updated
- [ ] `npm run build:win` successful
- [ ] `dist/Autrex-{version}-setup.exe` created
- [ ] `dist/latest.yml` created with correct version
- [ ] GitHub release created
- [ ] Both files uploaded (`.exe` and `.yml`)
- [ ] Release published (not draft)
- [ ] Update tested from old version

## 🎯 Quick Commands

```bash
# Update version and build
npm version patch  # or minor, major
npm run build:win

# Verify files
ls -lh dist/Autrex-*-setup.exe dist/latest.yml
cat dist/latest.yml

# Git operations (after adding remote)
git add .
git commit -m "v1.x.x: Description"
git tag v1.x.x
git push origin main
git push origin v1.x.x
```

## 💡 Tips

1. **Always Test:** Test before pushing to production
2. **Write Changelog:** Users want to know what changed
3. **Small Steps:** Break big changes into smaller releases
4. **Backup:** Backup before major changes
5. **User Feedback:** Monitor user feedback after release

## 🔗 Useful Links

- **GitHub Releases:** https://github.com/Spryzenweb/Autrex/releases
- **electron-builder Docs:** https://www.electron.build/
- **electron-updater Docs:** https://www.electron.build/auto-update

## 📞 Troubleshooting

1. Check `dist/latest.yml` file
2. Verify both files exist in GitHub release
3. Check console logs (DevTools)
4. Read logs in `updaterService.ts`

---

**Last Updated:** v1.1.3 - March 2026
